"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceSheet = exports.getProfitLoss = exports.getTrialBalance = void 0;
const reports_schema_1 = require("./reports.schema");
const reportsService = __importStar(require("./reports.service"));
const response_1 = require("../../lib/response");
const today = () => new Date().toISOString().split("T")[0];
// GET /api/reports/trial-balance?company_id=uuid&as_of_date=2026-06-30
const getTrialBalance = async (req, res) => {
    const parsed = reports_schema_1.trialBalanceSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, as_of_date } = parsed.data;
        const report = await reportsService.getTrialBalance(company_id, as_of_date ?? today());
        return (0, response_1.sendSuccess)(res, report);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getTrialBalance = getTrialBalance;
// GET /api/reports/profit-loss?company_id=uuid&start_date=...&end_date=...
const getProfitLoss = async (req, res) => {
    const parsed = reports_schema_1.profitLossSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, start_date, end_date } = parsed.data;
        const report = await reportsService.getProfitLoss(company_id, start_date, end_date);
        return (0, response_1.sendSuccess)(res, report);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getProfitLoss = getProfitLoss;
// GET /api/reports/balance-sheet?company_id=uuid&as_of_date=2026-06-30
const getBalanceSheet = async (req, res) => {
    const parsed = reports_schema_1.balanceSheetSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, as_of_date } = parsed.data;
        const report = await reportsService.getBalanceSheet(company_id, as_of_date ?? today());
        return (0, response_1.sendSuccess)(res, report);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getBalanceSheet = getBalanceSheet;
