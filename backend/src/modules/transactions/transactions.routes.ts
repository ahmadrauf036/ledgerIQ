import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
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
transactionsRoutes.use(authorize("super_admin"));

transactionsRoutes.get("/", getEntries);
transactionsRoutes.get("/ledger/:account_id", getLedger);
transactionsRoutes.get("/:id", getEntry);
transactionsRoutes.post("/", createEntry);
transactionsRoutes.patch("/:id", updateEntry);
transactionsRoutes.post("/:id/post", postEntry);
transactionsRoutes.delete("/:id", deleteEntry);
