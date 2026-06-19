import { z } from "zod"

const entryLineSchema = z.object({
    account_id: z.string().min(1, "Account is required"),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    description: z.string().optional(),
}).refine(
    (line) => {
        const hasDebit = line.debit > 0
        const hasCredit = line.credit > 0
        return (hasDebit && !hasCredit) || (!hasDebit && hasCredit)
    },
    { message: "Enter either a debit or credit amount, not both" }
)

export const journalEntrySchema = z.object({
    date: z.string().min(1, "Date is required"),
    description: z.string().optional(),
    lines: z
        .array(entryLineSchema)
        .min(2, "At least 2 lines are required"),
}).refine(
    (data) => {
        const totalDebit = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0)
        const totalCredit = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0)
        return Math.abs(totalDebit - totalCredit) < 0.01
    },
    { message: "Total debits must equal total credits", path: ["lines"] }
)

export type JournalEntryForm = z.infer<typeof journalEntrySchema>