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
