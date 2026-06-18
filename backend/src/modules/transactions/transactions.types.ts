import { Request } from "express";

export type EntryStatus = "draft" | "posted";

export interface JournalEntry {
    id: string;
    company_id: string;
    entry_number: string;
    date: string;
    description: string | null;
    status: EntryStatus;
    created_by: string | null;
    posted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface EntryLine {
    id: string;
    entry_id: string;
    account_id: string;
    debit: number;
    credit: number;
    description: string | null;
    created_at: string;
}

export interface EntryLineInput {
    account_id: string;
    debit: number;
    credit: number;
    description?: string | null;
}

export interface JournalEntryWithLines extends JournalEntry {
    lines: (EntryLine & {
        account_code: string;
        account_name: string;
    })[];
}

export interface CreateEntryBody {
    company_id: string;
    date: string;
    description?: string | null;
    status: EntryStatus;
    lines: EntryLineInput[];
}

export interface UpdateEntryBody {
    date?: string;
    description?: string | null;
    lines?: EntryLineInput[];
}

export interface LedgerRow {
    entry_id: string;
    entry_number: string;
    date: string;
    description: string | null;
    debit: number;
    credit: number;
    running_balance: number;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
