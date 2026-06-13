import { create } from "zustand";
import { supabase } from "@/lib/supabase.utils";
import type { Client, CreateClientPayload } from "./clients.types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth headers
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
    error: string | null;
    fetchClients: () => Promise<void>;
    createClient: (
        payload: CreateClientPayload,
    ) => Promise<{ error: string | null }>;
}

export const useClientsStore = create<ClientsState>((set) => ({
    clients: [],
    loading: false,
    creating: false,
    error: null,

    fetchClients: async () => {
        set({ loading: true, error: null });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/clients`, { headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ clients: json.data, loading: false }); // already flat
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

            // Add new client to list
            set((state) => ({
                clients: [...state.clients, json.data.company],
                creating: false,
            }));
            return { error: null };
        } catch (err) {
            set({ creating: false });
            return { error: (err as Error).message };
        }
    },
}));
