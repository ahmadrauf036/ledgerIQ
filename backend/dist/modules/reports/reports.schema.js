"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceSheetSchema = exports.profitLossSchema = exports.trialBalanceSchema = void 0;
const zod_1 = require("zod");
exports.trialBalanceSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    as_of_date: zod_1.z.string().optional(), // defaults to today
});
exports.profitLossSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    start_date: zod_1.z.string().min(1, "Start date is required"),
    end_date: zod_1.z.string().min(1, "End date is required"),
});
exports.balanceSheetSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    as_of_date: zod_1.z.string().optional(), // defaults to today
});
