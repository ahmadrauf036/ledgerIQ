import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "@/shared/error.middleware";
import { authRoutes } from "@/modules/auth/auth.routes";
import { clientsRoutes } from "./modules/clients/clients.routes";

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

