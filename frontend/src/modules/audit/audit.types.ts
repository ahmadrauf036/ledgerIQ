export type AuditAction =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "POST"
    | "DEACTIVATE"
    | "ACTIVATE"
    | "INVITE";

export interface AuditLog {
    id: string;
    company_id: string | null;
    user_id: string | null;
    action: AuditAction;
    table_name: string;
    record_id: string | null;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
    user_email: string | null;
    user_full_name: string | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AuditLogsResponse {
    logs: AuditLog[];
    pagination: Pagination;
}

export interface AuditFilterOptions {
    table_names: string[];
    actions: AuditAction[];
}

export interface AuditFilters {
    company_id?: string;
    table_name?: string;
    action?: AuditAction;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}
