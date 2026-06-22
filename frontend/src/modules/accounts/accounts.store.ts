import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type {
    Account,
    CreateAccountPayload,
    UpdateAccountPayload,
} from "./accounts.types";

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

interface AccountsState {
    accounts: Account[];
    flatAccounts: Account[];
    loading: boolean;
    creating: boolean;
    updating: boolean;
    error: string | null;
    activeCompanyId: string | null;
    setActiveCompany: (companyId: string) => void;
    fetchAccounts: (companyId: string, type?: string) => Promise<void>;
    createAccount: (
        payload: CreateAccountPayload,
    ) => Promise<{ error: string | null }>;
    updateAccount: (
        id: string,
        payload: UpdateAccountPayload,
    ) => Promise<{ error: string | null }>;
    deactivateAccount: (id: string) => Promise<{ error: string | null }>;
}

// Flatten tree into a list — used for parent dropdown
const flattenTree = (accounts: Account[]): Account[] => {
    const result: Account[] = []
    const walk = (nodes: Account[]) => {
        for (const node of nodes) {
            result.push({
                ...node,
                hasChildren: (node.children?.length ?? 0) > 0, // ← add this
            })
            if (node.children?.length) walk(node.children)
        }
    }
    walk(accounts)
    return result
}

export const useAccountsStore = create<AccountsState>((set) => ({
    accounts: [],
    flatAccounts: [],
    loading: false,
    creating: false,
    updating: false,
    error: null,
    activeCompanyId: null,

    setActiveCompany: (companyId) => {
        set({ activeCompanyId: companyId });
    },

    fetchAccounts: async (companyId, type) => {
        set({ loading: true, error: null });
        try {
            const headers = await getHeaders();
            const params = new URLSearchParams({ company_id: companyId });
            if (type) params.append("type", type);

            const res = await fetch(`${API_URL}/accounts?${params}`, {
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            set({
                accounts: json.data,
                flatAccounts: flattenTree(json.data),
                loading: false,
            });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    createAccount: async (payload) => {
        set({ creating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/accounts`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ creating: false });
            return { error: null };
        } catch (err) {
            set({ creating: false });
            return { error: (err as Error).message };
        }
    },

    updateAccount: async (id, payload) => {
        set({ updating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/accounts/${id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ updating: false });
            return { error: null };
        } catch (err) {
            set({ updating: false });
            return { error: (err as Error).message };
        }
    },

    deactivateAccount: async (id) => {
        set({ updating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/accounts/${id}`, {
                method: "DELETE",
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ updating: false });
            return { error: null };
        } catch (err) {
            set({ updating: false });
            return { error: (err as Error).message };
        }
    },
}));
