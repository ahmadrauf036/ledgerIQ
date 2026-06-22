import { Response } from "express";
import { AuthRequest } from "./reports.types";
import {
    trialBalanceSchema,
    profitLossSchema,
    balanceSheetSchema,
} from "./reports.schema";
import * as reportsService from "./reports.service";
import { sendSuccess, sendError } from "../../lib/response";

const today = () => new Date().toISOString().split("T")[0];

// GET /api/reports/trial-balance?company_id=uuid&as_of_date=2026-06-30
export const getTrialBalance = async (req: AuthRequest, res: Response) => {
    const parsed = trialBalanceSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, as_of_date } = parsed.data;
        const report = await reportsService.getTrialBalance(
            company_id,
            as_of_date ?? today(),
        );
        return sendSuccess(res, report);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/reports/profit-loss?company_id=uuid&start_date=...&end_date=...
export const getProfitLoss = async (req: AuthRequest, res: Response) => {
    const parsed = profitLossSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, start_date, end_date } = parsed.data;
        const report = await reportsService.getProfitLoss(
            company_id,
            start_date,
            end_date,
        );
        return sendSuccess(res, report);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/reports/balance-sheet?company_id=uuid&as_of_date=2026-06-30
export const getBalanceSheet = async (req: AuthRequest, res: Response) => {
    const parsed = balanceSheetSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, as_of_date } = parsed.data;
        const report = await reportsService.getBalanceSheet(
            company_id,
            as_of_date ?? today(),
        );
        return sendSuccess(res, report);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
