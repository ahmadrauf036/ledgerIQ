import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes"; 
import { supabase } from "./lib/supabase.utils"; 
import { useAuthStore } from "./modules/auth/auth.store"; 
import "./index.css";
import { Toaster } from "sonner";
function Root() {
    const setSession = useAuthStore((s) => s.setSession);

    useEffect(() => {
        // Check if a session already exists on app load
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Session on load:", session); // remove later
            setSession(session);
        });

        // Listen for auth changes (login, logout, token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Auth state changed:", _event, session); // remove later
            setSession(session);
        });

        // Cleanup listener on unmount
        return () => subscription.unsubscribe();
    }, [setSession]);

    return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Root />
        <Toaster position="top-right" richColors />
    </StrictMode>,
);
