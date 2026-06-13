import { z } from "zod";


export const inviteUserSchema = z.object({
    email: z.string().email("Invalid email"),
    role: z.enum(["client_owner", "bookkeeper"]),
    company_id: z.string().uuid("Invalid company ID"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
});

export const deleteUserSchema = z.object({
    user_id: z.string().uuid("Invalid user ID"),
});