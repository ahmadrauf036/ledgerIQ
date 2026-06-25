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
import { enforceCompanyScope } from "../auth/scope.middleware";

export const accountsRoutes = Router();

accountsRoutes.use(authenticate);

// Read — all three roles, scoped to own company
accountsRoutes.get(
    "/",
    authorize("super_admin", "client_owner", "bookkeeper"),
    enforceCompanyScope,
    getAccounts,
);
accountsRoutes.get(
    "/flat",
    authorize("super_admin", "client_owner", "bookkeeper"),
    enforceCompanyScope,
    getAccountsFlat,
);
accountsRoutes.get(
    "/:id",
    authorize("super_admin", "client_owner", "bookkeeper"),
    getAccount,
);

// Write — super_admin + bookkeeper only (client_owner is read-only)
accountsRoutes.post(
    "/",
    authorize("super_admin", "bookkeeper"),
    enforceCompanyScope,
    createAccount,
);
accountsRoutes.patch(
    "/:id",
    authorize("super_admin", "bookkeeper"),
    updateAccount,
);
accountsRoutes.delete(
    "/:id",
    authorize("super_admin", "bookkeeper"),
    deactivateAccount,
);
accountsRoutes.post(
    "/seed/:company_id",
    authorize("super_admin"), // seeding only happens on client creation by ACCA
    seedAccounts,
);