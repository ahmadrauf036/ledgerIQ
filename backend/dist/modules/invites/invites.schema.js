"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInviteSchema = exports.validateInviteSchema = exports.sendInviteSchema = void 0;
const zod_1 = require("zod");
exports.sendInviteSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    role: zod_1.z.enum(["client_owner", "bookkeeper"], { error: "Role is required" }),
    company_id: zod_1.z.string().uuid("Invalid company ID"),
});
exports.validateInviteSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
});
exports.acceptInviteSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    full_name: zod_1.z.string().min(1, "Full name is required"),
});
