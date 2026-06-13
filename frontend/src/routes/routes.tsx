import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import Login from "@/pages/auth/Login";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import Unauthorized from "@/pages/unauthorized/Unauthorized";
import ProtectedRoute from "@/routes/ProtectedRoute";
import DashboardLayout from "@/pages/DashboardLayout";
import ClientsPage from "@/pages/clients/Clients";
import { RoleRedirect } from "./roleRedirect";
import ForgotPassword from "@/pages/auth/ForgetPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import SetPassword from "@/pages/auth/SetPassword";


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

            // Public
            {
                path: "login",
                element: <RoleRedirect />,
            },
            { path: "login", element: <Login /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password", element: <ResetPassword /> },
            { path: "set-password", element: <SetPassword /> },
            { path: "unauthorized", element: <Unauthorized /> },

            // Public
            {
                path: "unauthorized",
                element: <Unauthorized />,
            },

            // Protected layout — all pages inside share the sidebar
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

                    // Add more routes here as pages are built
                    // {
                    //     path: "accounts",
                    //     element: (
                    //         <ProtectedRoute allowedRoles={["super_admin", "client_owner", "bookkeeper"]}>
                    //             <ChartOfAccountsPage />
                    //         </ProtectedRoute>
                    //     ),
                    // },
                ],
            },

            // Catch-all
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);
