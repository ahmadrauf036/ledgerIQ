import { Request } from "express";

export interface FileFolder {
    id: string;
    company_id: string;
    name: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface FileFolderWithCount extends FileFolder {
    file_count: number;
}

export interface FileRecord {
    id: string;
    company_id: string;
    folder_id: string | null;
    uploaded_by: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    description: string | null;
    created_at: string;
}

export interface FileRecordWithUploader extends FileRecord {
    uploader_email: string | null;
    uploader_full_name: string | null;
}

export interface CreateFolderBody {
    company_id: string;
    name: string;
}

export interface UpdateFolderBody {
    name: string;
}

export interface UploadFileMetadata {
    company_id: string;
    folder_id?: string | null;
    description?: string | null;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        company_id:string
    };
}

export const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/msword", // doc
    "text/csv",
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
