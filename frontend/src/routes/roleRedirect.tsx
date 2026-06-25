import { useAuthStore } from "../modules/auth/auth.store";
import Login from "../pages/auth/Login";
import { Navigate } from "react-router-dom";

export function RoleRedirect() {
    const { user, role } = useAuthStore();
    if (!user) return <Login />;

    if (role === "super_admin") return <Navigate to="/dashboard" replace />;
    if (role === "client_owner") return <Navigate to="/my-dashboard" replace />;
    if (role === "bookkeeper") return <Navigate to="/my-dashboard" replace />;

    return <Navigate to="/unauthorized" replace />;
}
