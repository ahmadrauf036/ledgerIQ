"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientSchema = exports.createClientSchema = void 0;
const zod_1 = require("zod");
exports.createClientSchema = zod_1.z.object({
    company_name: zod_1.z.string().min(1, "Company name is required"),
    full_name: zod_1.z.string().min(1, "Full name is required"),
    email: zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    ntn_number: zod_1.z.string().optional(),
    financial_year_start: zod_1.z
        .number()
        .min(1, "Invalid month")
        .max(12, "Invalid month"),
    currency: zod_1.z.enum(["PKR", "USD"]),
});
exports.updateClientSchema = zod_1.z.object({
    company_name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    ntn_number: zod_1.z.string().optional(),
    financial_year_start: zod_1.z.number().min(1).max(12).optional(),
    currency: zod_1.z.enum(["PKR", "USD"]).optional(),
    is_active: zod_1.z.boolean().optional(),
});
