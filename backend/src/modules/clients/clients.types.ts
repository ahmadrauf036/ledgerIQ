import { Request } from "express";

export interface Company {
    id: string;
    name: string;
    owner_id: string | null;
    currency: string;
    financial_year_start: number;
    address: string | null;
    phone: string | null;
    ntn_number: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateClientBody {
    company_name: string;
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    ntn_number?: string;
    financial_year_start: number;
    currency: "PKR" | "USD";
}

export interface ClientWithUser extends Company {
    user_id: string;
    user_email: string;
    full_name: string;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
