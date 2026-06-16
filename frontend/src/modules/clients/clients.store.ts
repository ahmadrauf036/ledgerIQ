import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type {
    Client,
    CreateClientPayload,
    UpdateClientPayload,
} from "./clients.types";

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

interface ClientsState {
    clients: Client[];
    loading: boolean;
    creating: boolean;
    updating: boolean;
    inviting: boolean;
    error: string | null;
    fetchClients: () => Promise<void>;
    createClient: (
        payload: CreateClientPayload,
    ) => Promise<{ error: string | null }>;
    updateClient: (
        id: string,
        payload: UpdateClientPayload,
    ) => Promise<{ error: string | null }>;
    deactivateClient: (id: string) => Promise<{ error: string | null }>;
    activateClient: (id: string) => Promise<{ error: string | null }>;
    inviteUser: (
        email: string,
        role: "client_owner" | "bookkeeper",
        companyId: string,
    ) => Promise<{ error: string | null }>;
}

export const useClientsStore = create<ClientsState>((set) => ({
    clients: [],
    loading: false,
    creating: false,
    updating: false,
    inviting: false,
    error: null,

    fetchClients: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/clients`, { headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ clients: json.data, loading: false });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    createClient: async (payload) => {
        set({ creating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/clients`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                clients: [
                    ...state.clients,
                    {
                        id: json.data.company.id,
                        company_name: json.data.company.name, // ← rename
                        full_name: "", // not set yet
                        email: json.data.company.email,
                        currency: json.data.company.currency,
                        financial_year_start:
                            json.data.company.financial_year_start,
                        address: json.data.company.address,
                        phone: json.data.company.phone,
                        ntn_number: json.data.company.ntn_number,
                        is_active: json.data.company.is_active,
                        created_at: json.data.company.created_at,
                        user_id: null,
                        invite_status: "pending",
                    },
                ],
                creating: false,
            }));
            return { error: null };
        } catch (err) {
            set({ creating: false });
            return { error: (err as Error).message };
        }
    },

    updateClient: async (id, payload) => {
        set({ updating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/clients/${id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                clients: state.clients.map((c) =>
                    c.id === id ? { ...c, ...json.data } : c,
                ),
                updating: false,
            }));
            return { error: null };
        } catch (err) {
            set({ updating: false });
            return { error: (err as Error).message };
        }
    },

    deactivateClient: async (id) => {
        set({ updating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/clients/${id}`, {
                method: "DELETE",
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                clients: state.clients.map((c) =>
                    c.id === id ? { ...c, is_active: false } : c,
                ),
                updating: false,
            }));
            return { error: null };
        } catch (err) {
            set({ updating: false });
            return { error: (err as Error).message };
        }
    },

    activateClient: async (id) => {
        set({ updating: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/clients/${id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ is_active: true }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                clients: state.clients.map((c) =>
                    c.id === id ? { ...c, is_active: true } : c,
                ),
                updating: false,
            }));
            return { error: null };
        } catch (err) {
            set({ updating: false });
            return { error: (err as Error).message };
        }
    },

    inviteUser: async (email, role, companyId) => {
        set({ inviting: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/invites/send`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    email,
                    role,
                    company_id: companyId,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ inviting: false });
            return { error: null };
        } catch (err) {
            set({ inviting: false });
            return { error: (err as Error).message };
        }
    },
}));
