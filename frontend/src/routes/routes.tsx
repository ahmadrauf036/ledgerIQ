import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App"; 
import Login from "../pages/auth/Login";
import { Dashboard } from "../pages/dashboard/Dashboard";
import Unauthorized from "../pages/unauthorized/Unauthorized";
import ProtectedRoute from "../routes/ProtectedRoute";
import DashboardLayout from "../pages/DashboardLayout";
import ClientsPage from "../pages/clients/Clients";
import { RoleRedirect } from "./roleRedirect";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import SetPassword from "../pages/auth/SetPassword";
import PublicRoute from "./PublicRoute";
import ChartOfAccountsPage from "../pages/accounts/ChartOfAccounts";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // Root redirect based on role
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <RoleRedirect />
                    </ProtectedRoute>
                ),
            },

            {
                path: "login",
                element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                ),
            },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password", element: <ResetPassword /> },
            { path: "set-password", element: <SetPassword /> },
            { path: "unauthorized", element: <Unauthorized /> },
            {
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    // super_admin only
                    {
                        path: "dashboard",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <Dashboard />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "clients",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <ClientsPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "accounts",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <ChartOfAccountsPage />
                            </ProtectedRoute>
                        ),
                    },

                    
                ],
            },
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);
