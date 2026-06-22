import { z } from "zod";

export const trialBalanceSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    as_of_date: z.string().optional(), // defaults to today
});

export const profitLossSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
});

export const balanceSheetSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    as_of_date: z.string().optional(), // defaults to today
});
