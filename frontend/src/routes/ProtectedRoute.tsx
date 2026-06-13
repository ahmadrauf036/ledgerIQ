import { Navigate } from "react-router-dom";
import { useAuthStore, type UserRole } from "@/modules/auth/auth.store";
import { Spinner } from "@/components/ui/spinner";

interface Props {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const { user, role, loading } = useAuthStore();

    // 1. Wait for session check to complete first
    if (loading) return <Spinner />;

    // 2. Now check if logged in
    if (!user) return <Navigate to="/login" replace />;

    // 3. Check role if required
    if (allowedRoles && !allowedRoles.includes(role!)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}
