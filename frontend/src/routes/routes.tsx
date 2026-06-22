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
import LedgerPage from "../pages/transactions/Ledger";
import JournalEntriesPage from "../pages/transactions/JournalEntries";
import ProfitLossPage from "../pages/reports/ProfitLoss";
import BalanceSheetPage from "../pages/reports/BalanceSheet";
import TrialBalancePage from "../pages/reports/TrialBalance";
import Reports from "../pages/reports/Reports";

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
                    {
                        path: "transactions",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <JournalEntriesPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "transactions/ledger",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <LedgerPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "reports",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <Reports />
                            </ProtectedRoute>
                        ),
                        children: [
                            {
                                index: true,
                                element: (
                                    <Navigate to="trial-balance" replace />
                                ),
                            },
                            {
                                path: "trial-balance",
                                element: <TrialBalancePage />,
                            },
                            {
                                path: "profit-loss",
                                element: <ProfitLossPage />,
                            },
                            {
                                path: "balance-sheet",
                                element: <BalanceSheetPage />,
                            },
                        ],
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
