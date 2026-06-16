// src/routes/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../modules/auth/auth.store";

export default function PublicRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuthStore();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
}
