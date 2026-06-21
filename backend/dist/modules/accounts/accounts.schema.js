"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountsSchema = exports.updateAccountSchema = exports.createAccountSchema = void 0;
const zod_1 = require("zod");
exports.createAccountSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    code: zod_1.z
        .string()
        .min(1, "Account code is required")
        .max(20, "Code too long"),
    name: zod_1.z
        .string()
        .min(1, "Account name is required")
        .max(100, "Name too long"),
    type: zod_1.z.enum(["asset", "liability", "equity", "revenue", "expense"], {
        error: "Invalid account type",
    }),
    parent_id: zod_1.z
        .string()
        .uuid("Invalid parent account ID")
        .nullable()
        .optional(),
    description: zod_1.z
        .string()
        .max(255, "Description too long")
        .nullable()
        .optional(),
});
exports.updateAccountSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(20).optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    type: zod_1.z
        .enum(["asset", "liability", "equity", "revenue", "expense"])
        .optional(),
    parent_id: zod_1.z.string().uuid().nullable().optional(),
    description: zod_1.z.string().max(255).nullable().optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.getAccountsSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    type: zod_1.z
        .enum(["asset", "liability", "equity", "revenue", "expense"])
        .optional(),
});
