import { Request } from "express";

export type AccountType =
    | "asset"
    | "liability"
    | "equity"
    | "revenue"
    | "expense";

export interface Account {
    id: string;
    company_id: string;
    code: string;
    name: string;
    type: AccountType;
    parent_id: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AccountWithBalance extends Account {
    total_debit: number;
    total_credit: number;
    balance: number;
    children?: AccountWithBalance[];
}

export interface CreateAccountBody {
    company_id: string;
    code: string;
    name: string;
    type: AccountType;
    parent_id?: string | null;
    description?: string | null;
}

export interface UpdateAccountBody {
    code?: string;
    name?: string;
    type?: AccountType;
    parent_id?: string | null;
    description?: string | null;
    is_active?: boolean;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        company_id: string;
    };
}
