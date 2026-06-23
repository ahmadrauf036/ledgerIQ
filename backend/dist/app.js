"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("./shared/error.middleware");
const auth_routes_1 = require("./modules/auth/auth.routes");
const clients_routes_1 = require("./modules/clients/clients.routes");
const invites_routes_1 = require("./modules/invites/invites.routes");
const accounts_routes_1 = require("./modules/accounts/accounts.routes");
const transactions_routes_1 = require("./modules/transactions/transactions.routes");
const reports_routes_1 = require("./modules/reports/reports.routes");
const audit_routes_1 = require("./modules/audit/audit.routes");
const folders_routes_1 = require("./modules/files/folders.routes");
const files_routes_1 = require("./modules/files/files.routes");
// Add this line with other routes
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// All routes
app.use("/api/auth", auth_routes_1.authRoutes);
app.use("/api/clients", clients_routes_1.clientsRoutes);
app.use("/api/invites", invites_routes_1.invitesRoutes);
app.use("/api/accounts", accounts_routes_1.accountsRoutes);
app.use("/api/transactions", transactions_routes_1.transactionsRoutes);
app.use("/api/reports", reports_routes_1.reportsRoutes);
app.use("/api/audit", audit_routes_1.auditRoutes);
app.use("/api/files/folders", folders_routes_1.foldersRoutes);
app.use("/api/files", files_routes_1.filesRoutes);
// Global error handler — must be last
app.use(error_middleware_1.errorHandler);
exports.default = app;
// const createSuperAdmin = async () => {
//     console.log("Creating super admin...");
//     // Step 1 — Create user
//     const { data, error } = await supabaseAdmin.auth.admin.createUser({
//         email: "developer@ledgeriq.com",
//         password: "Nothing31@",
//         email_confirm: true,
//         app_metadata: {
//             role: "super_admin",
//         },
//         user_metadata: {
//             full_name: "Ahmad Rauf",
//         },
//     });
//     if (error) {
//         console.error("Error creating super admin:", error.message);
//         process.exit(1);
//     }
//     console.log("Super admin created successfully!");
//     console.log("User ID:", data.user.id);
//     console.log("Email:  ", data.user.email);
//     console.log("Role:   ", data.user.app_metadata.role);
//     process.exit(0);
// };
// createSuperAdmin();
