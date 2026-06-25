import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { enforceCompanyScope } from "../auth/scope.middleware";
import {
    getTrialBalance,
    getProfitLoss,
    getBalanceSheet,
} from "./reports.controller";

export const reportsRoutes = Router();

reportsRoutes.use(authenticate);

// Read only — super_admin + client_owner (bookkeeper excluded per access matrix)
reportsRoutes.get(
    "/trial-balance",
    authorize("super_admin", "client_owner"),
    enforceCompanyScope,
    getTrialBalance,
);
reportsRoutes.get(
    "/profit-loss",
    authorize("super_admin", "client_owner"),
    enforceCompanyScope,
    getProfitLoss,
);
reportsRoutes.get(
    "/balance-sheet",
    authorize("super_admin", "client_owner"),
    enforceCompanyScope,
    getBalanceSheet,
);
