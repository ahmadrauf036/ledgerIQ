import { z } from "zod";

export const createAccountSchema = z.object({
    code: z
        .string()
        .min(1, "Account code is required")
        .max(20, "Code too long"),
    name: z
        .string()
        .min(1, "Account name is required")
        .max(100, "Name too long"),
    type: z.enum(["asset", "liability", "equity", "revenue", "expense"], {
        error: "Account type is required",
    }),
    parent_id: z.string().uuid().nullable().optional(),
    description: z.string().max(255).optional(),
});

export const updateAccountSchema = z.object({
    code: z.string().min(1).max(20).optional(),
    name: z.string().min(1).max(100).optional(),
    type: z
        .enum(["asset", "liability", "equity", "revenue", "expense"])
        .optional(),
    parent_id: z.string().uuid().nullable().optional(),
    description: z.string().max(255).optional(),
});

export type CreateAccountForm = z.infer<typeof createAccountSchema>;
export type UpdateAccountForm = z.infer<typeof updateAccountSchema>;
