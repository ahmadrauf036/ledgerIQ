"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntriesSchema = exports.updateEntrySchema = exports.createEntrySchema = void 0;
const zod_1 = require("zod");
const entryLineSchema = zod_1.z.object({
    account_id: zod_1.z
        .string()
        .uuid("Invalid account"),
    debit: zod_1.z
        .number()
        .min(0, "Debit cannot be negative")
        .default(0),
    credit: zod_1.z
        .number()
        .min(0, "Credit cannot be negative")
        .default(0),
    description: zod_1.z
        .string()
        .max(255)
        .nullable()
        .optional(),
}).refine((line) => {
    const hasDebit = line.debit > 0;
    const hasCredit = line.credit > 0;
    // exactly one must be true
    return (hasDebit && !hasCredit) || (!hasDebit && hasCredit);
}, { message: "Each line must have either a debit or a credit amount, not both or neither" });
exports.createEntrySchema = zod_1.z.object({
    company_id: zod_1.z
        .string()
        .uuid("Invalid company ID"),
    date: zod_1.z
        .string()
        .min(1, "Date is required"),
    description: zod_1.z
        .string()
        .max(255)
        .nullable()
        .optional(),
    status: zod_1.z.enum(["draft", "posted"]).default("draft"),
    lines: zod_1.z
        .array(entryLineSchema)
        .min(2, "At least 2 lines are required"),
}).refine((data) => {
    const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);
    // floating point safe comparison
    return Math.abs(totalDebit - totalCredit) < 0.01;
}, { message: "Total debits must equal total credits" });
exports.updateEntrySchema = zod_1.z.object({
    date: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().max(255).nullable().optional(),
    lines: zod_1.z
        .array(entryLineSchema)
        .min(2, "At least 2 lines are required")
        .optional(),
}).refine((data) => {
    if (!data.lines)
        return true;
    const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
}, { message: "Total debits must equal total credits" });
exports.getEntriesSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    status: zod_1.z.enum(["draft", "posted"]).optional(),
});
