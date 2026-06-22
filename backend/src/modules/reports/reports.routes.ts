import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
    getTrialBalance,
    getProfitLoss,
    getBalanceSheet,
} from "./reports.controller";

export const reportsRoutes = Router();

reportsRoutes.use(authenticate);
reportsRoutes.use(authorize("super_admin"));

reportsRoutes.get("/trial-balance", getTrialBalance);
reportsRoutes.get("/profit-loss", getProfitLoss);
reportsRoutes.get("/balance-sheet", getBalanceSheet);
