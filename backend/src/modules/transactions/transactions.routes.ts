import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { enforceCompanyScope } from "../auth/scope.middleware";
import {
    getEntries,
    getEntry,
    createEntry,
    updateEntry,
    postEntry,
    deleteEntry,
    getLedger,
} from "./transactions.controller";

export const transactionsRoutes = Router();

transactionsRoutes.use(authenticate);

// Read — all three roles, scoped
transactionsRoutes.get(
    "/",
    authorize("super_admin", "client_owner", "bookkeeper"),
    enforceCompanyScope,
    getEntries,
);
transactionsRoutes.get(
    "/ledger/:account_id",
    authorize("super_admin", "client_owner", "bookkeeper"),
    getLedger,
);
transactionsRoutes.get(
    "/:id",
    authorize("super_admin", "client_owner", "bookkeeper"),
    getEntry,
);

// Write — super_admin + bookkeeper only
transactionsRoutes.post(
    "/",
    authorize("super_admin", "bookkeeper"),
    enforceCompanyScope,
    createEntry,
);
transactionsRoutes.patch(
    "/:id",
    authorize("super_admin", "bookkeeper"),
    updateEntry,
);
transactionsRoutes.post(
    "/:id/post",
    authorize("super_admin", "bookkeeper"),
    postEntry,
);
transactionsRoutes.delete(
    "/:id",
    authorize("super_admin", "bookkeeper"),
    deleteEntry,
);
