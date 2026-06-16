import { z } from "zod";

export const sendInviteSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    role: z.enum(["client_owner", "bookkeeper"] as const, { error: "Role is required" }),
    company_id: z.string().uuid("Invalid company ID"),
});

export const validateInviteSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export const acceptInviteSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    full_name: z.string().min(1, "Full name is required"),
});
