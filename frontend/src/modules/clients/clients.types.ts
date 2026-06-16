// Missing from Client interface
export interface Client {
    id: string;
    company_name: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    ntn_number?: string;
    financial_year_start: number;
    currency: "PKR" | "USD";
    is_active: boolean;
    created_at: string;
    user_id: string | null; // ← make nullable (pending clients have no user)
    invite_status?: "pending" | "accepted"; // ← add this
}

export interface CreateClientPayload {
    company_name: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    ntn_number?: string;
    financial_year_start: number;
    currency: "PKR" | "USD";
}

export interface UpdateClientPayload {
    company_name?: string;
    phone?: string;
    address?: string;
    ntn_number?: string;
    financial_year_start?: number;
    currency?: "PKR" | "USD";
    is_active?: boolean;
}
