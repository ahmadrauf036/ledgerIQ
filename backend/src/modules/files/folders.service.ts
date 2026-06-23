import { supabaseAdmin } from "../../lib/supabase";
import { logAction } from "../audit/audit.service";
import type { CreateFolderBody, UpdateFolderBody } from "./files.types";

// ── Get all folders for a company (with file counts) ──
export const getFolders = async (companyId: string) => {
    const { data: folders, error } = await supabaseAdmin
        .from("file_folders")
        .select("*")
        .eq("company_id", companyId)
        .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    // Get file count per folder
    const { data: fileCounts, error: countError } = await supabaseAdmin
        .from("files")
        .select("folder_id")
        .eq("company_id", companyId);

    if (countError) throw new Error(countError.message);

    const countMap = new Map<string, number>();
    for (const f of fileCounts ?? []) {
        if (f.folder_id) {
            countMap.set(f.folder_id, (countMap.get(f.folder_id) ?? 0) + 1);
        }
    }

    return (folders ?? []).map((folder) => ({
        ...folder,
        file_count: countMap.get(folder.id) ?? 0,
    }));
};

// ── Get single folder ─────────────────────────────
export const getFolderById = async (folderId: string) => {
    const { data, error } = await supabaseAdmin
        .from("file_folders")
        .select("*")
        .eq("id", folderId)
        .single();

    if (error) throw new Error("Folder not found");
    return data;
};

// ── Create folder ─────────────────────────────────
export const createFolder = async (
    body: CreateFolderBody,
    createdBy: string,
) => {
    const { company_id, name } = body;

    // Check name uniqueness within company
    const { data: existing } = await supabaseAdmin
        .from("file_folders")
        .select("id")
        .eq("company_id", company_id)
        .eq("name", name)
        .single();

    if (existing) {
        throw new Error(`A folder named "${name}" already exists`);
    }

    const { data, error } = await supabaseAdmin
        .from("file_folders")
        .insert({
            company_id,
            name,
            created_by: createdBy,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    logAction({
        company_id,
        user_id: createdBy,
        action: "CREATE",
        table_name: "file_folders",
        record_id: data.id,
        new_data: { name },
    });

    return data;
};

// ── Rename folder ─────────────────────────────────
export const updateFolder = async (
    folderId: string,
    body: UpdateFolderBody,
    updatedBy: string,
) => {
    const { data: folder, error: fetchError } = await supabaseAdmin
        .from("file_folders")
        .select("*")
        .eq("id", folderId)
        .single();

    if (fetchError) throw new Error("Folder not found");

    // Check new name uniqueness within company (excluding self)
    const { data: existing } = await supabaseAdmin
        .from("file_folders")
        .select("id")
        .eq("company_id", folder.company_id)
        .eq("name", body.name)
        .neq("id", folderId)
        .single();

    if (existing) {
        throw new Error(`A folder named "${body.name}" already exists`);
    }

    const { data, error } = await supabaseAdmin
        .from("file_folders")
        .update({
            name: body.name,
            updated_at: new Date().toISOString(),
        })
        .eq("id", folderId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    logAction({
        company_id: folder.company_id,
        user_id: updatedBy,
        action: "UPDATE",
        table_name: "file_folders",
        record_id: folderId,
        old_data: { name: folder.name },
        new_data: { name: body.name },
    });

    return data;
};

// ── Delete folder (cascades to files via FK) ─────
export const deleteFolder = async (folderId: string, deletedBy: string) => {
    const { data: folder, error: fetchError } = await supabaseAdmin
        .from("file_folders")
        .select("*")
        .eq("id", folderId)
        .single();

    if (fetchError) throw new Error("Folder not found");

    // Get all files in this folder first (to delete from storage)
    const { data: files, error: filesError } = await supabaseAdmin
        .from("files")
        .select("file_path")
        .eq("folder_id", folderId);

    if (filesError) throw new Error(filesError.message);

    // Delete all files from storage
    if (files && files.length > 0) {
        const paths = files.map((f) => f.file_path);
        const { error: storageError } = await supabaseAdmin.storage
            .from("client-files")
            .remove(paths);

        if (storageError) {
            console.error("Storage cleanup error:", storageError.message);
            // Don't block folder deletion if storage cleanup partially fails
        }
    }

    // Delete folder (files table rows cascade automatically via FK)
    const { error } = await supabaseAdmin
        .from("file_folders")
        .delete()
        .eq("id", folderId);

    if (error) throw new Error(error.message);

    logAction({
        company_id: folder.company_id,
        user_id: deletedBy,
        action: "DELETE",
        table_name: "file_folders",
        record_id: folderId,
        old_data: { name: folder.name, files_deleted: files?.length ?? 0 },
    });

    return { message: "Folder and its files deleted successfully" };
};
