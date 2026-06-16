import { z } from "zod";

export const createAccountSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    code: z
        .string()
        .min(1, "Account code is required")
        .max(20, "Code too long"),
    name: z
        .string()
        .min(1, "Account name is required")
        .max(100, "Name too long"),
    type: z.enum(["asset", "liability", "equity", "revenue", "expense"], {
        error: "Invalid account type",
    }),
    parent_id: z
        .string()
        .uuid("Invalid parent account ID")
        .nullable()
        .optional(),
    description: z
        .string()
        .max(255, "Description too long")
        .nullable()
        .optional(),
});

export const updateAccountSchema = z.object({
    code: z.string().min(1).max(20).optional(),
    name: z.string().min(1).max(100).optional(),
    type: z
        .enum(["asset", "liability", "equity", "revenue", "expense"])
        .optional(),
    parent_id: z.string().uuid().nullable().optional(),
    description: z.string().max(255).nullable().optional(),
    is_active: z.boolean().optional(),
});

export const getAccountsSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    type: z
        .enum(["asset", "liability", "equity", "revenue", "expense"])
        .optional(),
});
