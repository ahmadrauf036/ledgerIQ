import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type UserRole = "super_admin" | "client_owner" | "bookkeeper";

interface AuthState {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    companyId: string | null; // ← added
    loading: boolean;
    signingIn: boolean;
    signIn: (
        email: string,
        password: string,
    ) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    role: null,
    companyId: null,
    loading: true,
    signingIn: false,

    signIn: async (email, password) => {
        set({ signingIn: true });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message || "Login failed");
            set({ signingIn: false });
            return { error: error.message };
        }

        const role = (data.user?.app_metadata?.role as UserRole) ?? null;
        const companyId =
            (data.user?.app_metadata?.company_id as string) ?? null;

        set({
            user: data.user,
            session: data.session,
            role,
            companyId,
            signingIn: false,
        });

        return { error: null };
    },

    signOut: async () => {
        set({ loading: true });
        await supabase.auth.signOut();
        set({
            user: null,
            session: null,
            role: null,
            companyId: null,
            loading: false,
        });
    },

    setSession: (session) => {
        const role = (session?.user?.app_metadata?.role as UserRole) ?? null;
        const companyId =
            (session?.user?.app_metadata?.company_id as string) ?? null;
        set({
            session,
            user: session?.user ?? null,
            role,
            companyId,
            loading: false,
        });
    },
}));
