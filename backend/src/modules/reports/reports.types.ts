import { Request } from "express";

export interface TrialBalanceRow {
    account_id: string;
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
}

export interface TrialBalanceResponse {
    company_id: string;
    as_of_date: string;
    rows: TrialBalanceRow[];
    total_debit: number;
    total_credit: number;
    is_balanced: boolean;
}

export interface ProfitLossRow {
    account_id: string;
    code: string;
    name: string;
    amount: number;
}

export interface ProfitLossResponse {
    company_id: string;
    start_date: string;
    end_date: string;
    revenue: ProfitLossRow[];
    expenses: ProfitLossRow[];
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
}

export interface BalanceSheetRow {
    account_id: string;
    code: string;
    name: string;
    amount: number;
}

export interface BalanceSheetResponse {
    company_id: string;
    as_of_date: string;
    assets: BalanceSheetRow[];
    liabilities: BalanceSheetRow[];
    equity: BalanceSheetRow[];
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    is_balanced: boolean;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
