export type EntryStatus = "draft" | "posted"

export interface EntryLine {
    id?: string
    account_id: string
    account_code?: string
    account_name?: string
    debit: number
    credit: number
    description?: string | null
}

export interface JournalEntry {
    id: string
    company_id: string
    entry_number: string
    date: string
    description: string | null
    status: EntryStatus
    created_by: string | null
    posted_at: string | null
    created_at: string
    updated_at: string
}

export interface JournalEntryWithLines extends JournalEntry {
    lines: EntryLine[]
}

export interface CreateEntryPayload {
    company_id: string
    date: string
    description?: string | null
    status: EntryStatus
    lines: EntryLine[]
}

export interface UpdateEntryPayload {
    date?: string
    description?: string | null
    lines?: EntryLine[]
}

export interface LedgerRow {
    entry_id: string
    entry_number: string
    date: string
    description: string | null
    debit: number
    credit: number
    running_balance: number
}

export interface LedgerResponse {
    account: {
        id: string
        code: string
        name: string
        type: string
        company_id: string
    }
    rows: LedgerRow[]
    closing_balance: number
}