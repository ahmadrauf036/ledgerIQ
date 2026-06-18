import { z } from "zod"

const entryLineSchema = z.object({
    account_id: z
        .string()
        .uuid("Invalid account"),
    debit: z
        .number()
        .min(0, "Debit cannot be negative")
        .default(0),
    credit: z
        .number()
        .min(0, "Credit cannot be negative")
        .default(0),
    description: z
        .string()
        .max(255)
        .nullable()
        .optional(),
}).refine(
    (line) => {
        const hasDebit = line.debit > 0
        const hasCredit = line.credit > 0
        // exactly one must be true
        return (hasDebit && !hasCredit) || (!hasDebit && hasCredit)
    },
    { message: "Each line must have either a debit or a credit amount, not both or neither" }
)

export const createEntrySchema = z.object({
    company_id: z
        .string()
        .uuid("Invalid company ID"),
    date: z
        .string()
        .min(1, "Date is required"),
    description: z
        .string()
        .max(255)
        .nullable()
        .optional(),
    status: z.enum(["draft", "posted"]).default("draft"),
    lines: z
        .array(entryLineSchema)
        .min(2, "At least 2 lines are required"),
}).refine(
    (data) => {
        const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0)
        const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0)
        // floating point safe comparison
        return Math.abs(totalDebit - totalCredit) < 0.01
    },
    { message: "Total debits must equal total credits" }
)

export const updateEntrySchema = z.object({
    date: z.string().min(1).optional(),
    description: z.string().max(255).nullable().optional(),
    lines: z
        .array(entryLineSchema)
        .min(2, "At least 2 lines are required")
        .optional(),
}).refine(
    (data) => {
        if (!data.lines) return true
        const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0)
        const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0)
        return Math.abs(totalDebit - totalCredit) < 0.01
    },
    { message: "Total debits must equal total credits" }
)

export const getEntriesSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    status: z.enum(["draft", "posted"]).optional(),
})