import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
    getAccounts,
    getAccountsFlat,
    getAccount,
    createAccount,
    updateAccount,
    deactivateAccount,
    seedAccounts,
} from "./accounts.controller";

export const accountsRoutes = Router();

// All routes require authentication
accountsRoutes.use(authenticate);

// Super admin only
accountsRoutes.use(authorize("super_admin"));

accountsRoutes.get("/", getAccounts);
accountsRoutes.get("/flat", getAccountsFlat);
accountsRoutes.get("/:id", getAccount);
accountsRoutes.post("/", createAccount);
accountsRoutes.patch("/:id", updateAccount);
accountsRoutes.delete("/:id", deactivateAccount);
accountsRoutes.post("/seed/:company_id", seedAccounts);
