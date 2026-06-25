import { supabaseAdmin } from "../../lib/supabase";
import { logAction } from "../audit/audit.service";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "./files.types";
import type { UploadFileMetadata } from "./files.types";

const BUCKET = "client-files";

// ── Validate file before upload ──────────────────
const validateFile = (mimetype: string, size: number) => {
    if (!ALLOWED_FILE_TYPES.includes(mimetype)) {
        throw new Error(
            `File type "${mimetype}" is not allowed. Allowed types: PDF, JPG, PNG, XLSX, XLS, DOCX, DOC, CSV`,
        );
    }
    if (size > MAX_FILE_SIZE) {
        throw new Error(
            `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        );
    }
};

// ── Get all files for a company (optionally filtered by folder) ──
export const getFiles = async (companyId: string, folderId?: string) => {
    let query = supabaseAdmin
        .from("files")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

    if (folderId) {
        query = query.eq("folder_id", folderId);
    } else {
        query = query.is("folder_id", null);
    }

    const { data: files, error } = await query;
    if (error) throw new Error(error.message);

    // Enrich with uploader info
    const userIds = [
        ...new Set((files ?? []).map((f) => f.uploaded_by).filter(Boolean)),
    ];
    const userMap = new Map<
        string,
        { email: string; full_name: string | null }
    >();

    for (const userId of userIds) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
            userId!,
        );
        if (userData?.user) {
            userMap.set(userId!, {
                email: userData.user.email ?? "",
                full_name: userData.user.user_metadata?.full_name ?? null,
            });
        }
    }

    return (files ?? []).map((file) => ({
        ...file,
        uploader_email: file.uploaded_by
            ? (userMap.get(file.uploaded_by)?.email ?? null)
            : null,
        uploader_full_name: file.uploaded_by
            ? (userMap.get(file.uploaded_by)?.full_name ?? null)
            : null,
    }));
};

// ── Get single file record ───────────────────────
export const getFileById = async (fileId: string) => {
    const { data, error } = await supabaseAdmin
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

    if (error) throw new Error("File not found");
    return data;
};

// ── Upload file ───────────────────────────────────
export const uploadFile = async (
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
    size: number,
    metadata: UploadFileMetadata,
    uploadedBy: string,
) => {
    validateFile(mimetype, size);

    const { company_id, folder_id, description } = metadata;

    // Verify folder belongs to same company (if provided)
    if (folder_id) {
        const { data: folder, error: folderError } = await supabaseAdmin
            .from("file_folders")
            .select("company_id")
            .eq("id", folder_id)
            .single();

        if (folderError || !folder) {
            throw new Error("Folder not found");
        }
        if (folder.company_id !== company_id) {
            throw new Error("Folder does not belong to this company");
        }
    }

    // Build storage path: {company_id}/{folder_id or "root"}/{uuid}-{filename}
    const fileId = crypto.randomUUID();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const folderSegment = folder_id ?? "root";
    const storagePath = `${company_id}/${folderSegment}/${fileId}-${sanitizedName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
            contentType: mimetype,
            upsert: false,
        });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Save record in files table
    const { data, error } = await supabaseAdmin
        .from("files")
        .insert({
            id: fileId,
            company_id,
            folder_id: folder_id ?? null,
            uploaded_by: uploadedBy,
            file_name: originalName,
            file_path: storagePath,
            file_size: size,
            file_type: mimetype,
            description: description ?? null,
        })
        .select()
        .single();

    if (error) {
        // Rollback storage upload if DB insert fails
        await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
        throw new Error(error.message);
    }

    logAction({
        company_id,
        user_id: uploadedBy,
        action: "CREATE",
        table_name: "files",
        record_id: data.id,
        new_data: { file_name: originalName, folder_id, size },
    });

    return data;
};

// ── Get signed URL (for preview — short expiry) ──
export const getPreviewUrl = async (fileId: string) => {
    const file = await getFileById(fileId);

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(file.file_path, 300); // 5 minutes — enough for preview

    if (error) throw new Error(error.message);

    return {
        url: data.signedUrl,
        file_name: file.file_name,
        file_type: file.file_type,
    };
};

// ── Get signed URL (for download — short expiry) ──
export const getDownloadUrl = async (fileId: string) => {
    const file = await getFileById(fileId);

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(file.file_path, 60, {
            download: file.file_name, // forces download with original filename
        });

    if (error) throw new Error(error.message);

    return {
        url: data.signedUrl,
        file_name: file.file_name,
    };
};

// ── Delete file ────────────────────────────────────
export const deleteFile = async (
    fileId: string,
    deletedBy: string,
    isAdmin: boolean,
    callerCompanyId: string | null,
) => {
    const file = await getFileById(fileId);

    // Company scope check first
    if (!isAdmin && file.company_id !== callerCompanyId) {
        throw new Error("You do not have access to this file");
    }

    // Then ownership check (only own uploads, unless admin)
    if (!isAdmin && file.uploaded_by !== deletedBy) {
        throw new Error("You can only delete files you uploaded");
    }
    // Remove from storage
    const { error: storageError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove([file.file_path]);

    if (storageError) {
        console.error("Storage delete error:", storageError.message);
        // Continue — still remove DB row even if storage cleanup fails partially
    }

    // Remove DB row
    const { error } = await supabaseAdmin
        .from("files")
        .delete()
        .eq("id", fileId);

    if (error) throw new Error(error.message);

    logAction({
        company_id: file.company_id,
        user_id: deletedBy,
        action: "DELETE",
        table_name: "files",
        record_id: fileId,
        old_data: { file_name: file.file_name },
    });

    return { message: "File deleted successfully" };
};
