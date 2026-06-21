"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.inviteUserSchema = void 0;
const zod_1 = require("zod");
exports.inviteUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    role: zod_1.z.enum(["client_owner", "bookkeeper"]),
    company_id: zod_1.z.string().uuid("Invalid company ID"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
});
exports.deleteUserSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid("Invalid user ID"),
});
