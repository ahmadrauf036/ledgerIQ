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
    description?: string | null;
    is_active: boolean;
    total_debit: number;
    total_credit: number;
    balance: number;
    children: Account[];
}

export interface CreateAccountPayload {
    company_id: string;
    code: string;
    name: string;
    type: AccountType;
    parent_id?: string | null;
    description?: string | null;
}

export interface UpdateAccountPayload {
    code?: string;
    name?: string;
    type?: AccountType;
    parent_id?: string | null;
    description?: string | null;
    is_active?: boolean;
}

export interface FlatAccount {
    account_id: string;
    company_id: string;
    code: string;
    name: string;
    type: AccountType;
    parent_id: string | null;
    is_active: boolean;
    balance: number;
}
