
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./shared/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes"; 
import { clientsRoutes } from "./modules/clients/clients.routes";
import { invitesRoutes } from "./modules/invites/invites.routes";
import { accountsRoutes } from "./modules/accounts/accounts.routes";
import { transactionsRoutes } from "./modules/transactions/transactions.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";
import { auditRoutes } from "./modules/audit/audit.routes";
import { foldersRoutes } from "./modules/files/folders.routes";
import { filesRoutes } from "./modules/files/files.routes";

// Add this line with other routes
const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }),
);
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// All routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/invites", invitesRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/files/folders", foldersRoutes);
app.use("/api/files", filesRoutes);
// Global error handler — must be last
app.use(errorHandler);

export default app;


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

