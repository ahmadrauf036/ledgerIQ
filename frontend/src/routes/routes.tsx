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
import AuditLogPage from "../pages/audit/AuditLog";
import FilesPage from "../pages/files/Files";
import MyDashboard from "../pages/dashboard/MyDashboard";
import MyAccountsPage from "../pages/my/MyAccounts";
import MyTransactionsPage from "../pages/my/MyTransactions";
import MyReportsPage from "../pages/my/MyReports";
import MyFilesPage from "../pages/my/MyFiles";
import MyLedgerPage from "../pages/my/MyLedger";

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
                    {
                        path: "audit",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <AuditLogPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "files",
                        element: (
                            <ProtectedRoute allowedRoles={["super_admin"]}>
                                <FilesPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-dashboard",
                        element: (
                            <ProtectedRoute
                                allowedRoles={["client_owner", "bookkeeper"]}
                            >
                                <MyDashboard />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-accounts",
                        element: (
                            <ProtectedRoute
                                allowedRoles={["client_owner", "bookkeeper"]}
                            >
                                <MyAccountsPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-transactions",
                        element: (
                            <ProtectedRoute
                                allowedRoles={["client_owner", "bookkeeper"]}
                            >
                                <MyTransactionsPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-reports",
                        element: (
                            <ProtectedRoute allowedRoles={["client_owner"]}>
                                <MyReportsPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-files",
                        element: (
                            <ProtectedRoute
                                allowedRoles={["client_owner", "bookkeeper"]}
                            >
                                <MyFilesPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-ledger",
                        element: (
                            <ProtectedRoute
                                allowedRoles={["client_owner", "bookkeeper"]}
                            >
                                <MyLedgerPage />
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
