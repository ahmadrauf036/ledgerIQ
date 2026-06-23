import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type {
    AuditLog,
    AuditFilters,
    AuditFilterOptions,
    Pagination,
} from "./audit.types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = async () => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
    };
};

interface AuditState {
    logs: AuditLog[];
    pagination: Pagination | null;
    filterOptions: AuditFilterOptions | null;
    loading: boolean;
    loadingFilters: boolean;
    error: string | null;

    fetchLogs: (filters: AuditFilters) => Promise<void>;
    fetchFilterOptions: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set) => ({
    logs: [],
    pagination: null,
    filterOptions: null,
    loading: false,
    loadingFilters: false,
    error: null,

    fetchLogs: async (filters) => {
        set({ loading: true, error: null });
        try {
            const headers = await getHeaders();
            const params = new URLSearchParams();

            if (filters.company_id)
                params.append("company_id", filters.company_id);
            if (filters.table_name)
                params.append("table_name", filters.table_name);
            if (filters.action) params.append("action", filters.action);
            if (filters.start_date)
                params.append("start_date", filters.start_date);
            if (filters.end_date) params.append("end_date", filters.end_date);
            params.append("page", String(filters.page ?? 1));
            params.append("limit", String(filters.limit ?? 50));

            const res = await fetch(`${API_URL}/audit?${params}`, { headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            set({
                logs: json.data.logs,
                pagination: json.data.pagination,
                loading: false,
            });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    fetchFilterOptions: async () => {
        set({ loadingFilters: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/audit/filters`, { headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ filterOptions: json.data, loadingFilters: false });
        } catch (err) {
            set({ error: (err as Error).message, loadingFilters: false });
        }
    },
}));
