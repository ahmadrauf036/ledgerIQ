import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export type UserRole = "super_admin" | "client_owner" | "bookkeeper";

interface AuthState {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    loading: boolean; // app-level loading (is session ready?)
    signingIn: boolean; // form-level loading (is login request in progress?)
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
    loading: true, // true until setSession is called on app start
    signingIn: false, // true only during login request

    signIn: async (email, password) => {
        set({ signingIn: true }); // ← start loading

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message || "Login failed");
            set({ signingIn: false }); // ← stop loading on error
            return { error: error.message };
        }

        const role = (data.user?.app_metadata?.role as UserRole) ?? null;

        set({
            user: data.user,
            session: data.session,
            role,
            signingIn: false, // ← stop loading on success
        });
        toast.success("Logged in successfully");

        return { error: null };
    },

    signOut: async () => {
        set({ loading: true }); // ← show loading while signing out
        await supabase.auth.signOut();
        set({ user: null, session: null, role: null, loading: false });
        toast.success("Logged out successfully");
    },

    setSession: (session) => {
        const role = (session?.user?.app_metadata?.role as UserRole) ?? null;
        set({
            session,
            user: session?.user ?? null,
            role,
            loading: false, // ← app session check is done
        });
    },
}));
