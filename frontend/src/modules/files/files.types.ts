export interface FileFolder {
    id: string;
    company_id: string;
    name: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
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
    uploader_email: string | null;
    uploader_full_name: string | null;
}

export interface PreviewUrlResponse {
    url: string;
    file_name: string;
    file_type: string;
}

export interface DownloadUrlResponse {
    url: string;
    file_name: string;
}

export const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/csv",
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
