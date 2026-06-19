import { create } from "zustand"
import { supabase } from "../../lib/supabase.utils"
import type {
    JournalEntry,
    JournalEntryWithLines,
    CreateEntryPayload,
    UpdateEntryPayload,
    LedgerResponse,
} from "./transactions.types"

const API_URL = import.meta.env.VITE_API_BASE_URL

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
    }
}

interface TransactionsState {
    entries: JournalEntry[]
    currentEntry: JournalEntryWithLines | null
    ledger: LedgerResponse | null
    loading: boolean
    loadingEntry: boolean
    loadingLedger: boolean
    creating: boolean
    updating: boolean
    posting: boolean
    deleting: boolean
    error: string | null

    fetchEntries: (companyId: string, status?: string) => Promise<void>
    fetchEntryById: (id: string) => Promise<void>
    createEntry: (payload: CreateEntryPayload) => Promise<{ error: string | null }>
    updateEntry: (id: string, payload: UpdateEntryPayload) => Promise<{ error: string | null }>
    postEntry: (id: string) => Promise<{ error: string | null }>
    deleteEntry: (id: string) => Promise<{ error: string | null }>
    fetchLedger: (accountId: string) => Promise<void>
    clearCurrentEntry: () => void
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
    entries: [],
    currentEntry: null,
    ledger: null,
    loading: false,
    loadingEntry: false,
    loadingLedger: false,
    creating: false,
    updating: false,
    posting: false,
    deleting: false,
    error: null,

    fetchEntries: async (companyId, status) => {
        set({ loading: true, error: null })
        try {
            const headers = await getHeaders()
            const params = new URLSearchParams({ company_id: companyId })
            if (status) params.append("status", status)

            const res = await fetch(`${API_URL}/transactions?${params}`, { headers })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set({ entries: json.data, loading: false })
        } catch (err) {
            set({ error: (err as Error).message, loading: false })
        }
    },

    fetchEntryById: async (id) => {
        set({ loadingEntry: true, error: null })
        try {
            const headers = await getHeaders()
            const res = await fetch(`${API_URL}/transactions/${id}`, { headers })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set({ currentEntry: json.data, loadingEntry: false })
        } catch (err) {
            set({ error: (err as Error).message, loadingEntry: false })
        }
    },

    createEntry: async (payload) => {
        set({ creating: true })
        try {
            const headers = await getHeaders()
            const res = await fetch(`${API_URL}/transactions`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set((state) => ({
                entries: [json.data, ...state.entries],
                creating: false,
            }))
            return { error: null }
        } catch (err) {
            set({ creating: false })
            return { error: (err as Error).message }
        }
    },

    updateEntry: async (id, payload) => {
        set({ updating: true })
        try {
            const headers = await getHeaders()
            const res = await fetch(`${API_URL}/transactions/${id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set((state) => ({
                entries: state.entries.map((e) =>
                    e.id === id ? { ...e, ...json.data } : e
                ),
                currentEntry: json.data,
                updating: false,
            }))
            return { error: null }
        } catch (err) {
            set({ updating: false })
            return { error: (err as Error).message }
        }
    },

    postEntry: async (id) => {
        set({ posting: true })
        try {
            const headers = await getHeaders()
            const res = await fetch(`${API_URL}/transactions/${id}/post`, {
                method: "POST",
                headers,
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set((state) => ({
                entries: state.entries.map((e) =>
                    e.id === id ? { ...e, ...json.data } : e
                ),
                posting: false,
            }))
            return { error: null }
        } catch (err) {
            set({ posting: false })
            return { error: (err as Error).message }
        }
    },

    deleteEntry: async (id) => {
        set({ deleting: true })
        try {
            const headers = await getHeaders()
            const res = await fetch(`${API_URL}/transactions/${id}`, {
                method: "DELETE",
                headers,
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set((state) => ({
                entries: state.entries.filter((e) => e.id !== id),
                deleting: false,
            }))
            return { error: null }
        } catch (err) {
            set({ deleting: false })
            return { error: (err as Error).message }
        }
    },

    fetchLedger: async (accountId) => {
        set({ loadingLedger: true, error: null })
        try {
            const headers = await getHeaders()
            const res = await fetch(
                `${API_URL}/transactions/ledger/${accountId}`,
                { headers }
            )
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            set({ ledger: json.data, loadingLedger: false })
        } catch (err) {
            set({ error: (err as Error).message, loadingLedger: false })
        }
    },

    clearCurrentEntry: () => set({ currentEntry: null }),
}))