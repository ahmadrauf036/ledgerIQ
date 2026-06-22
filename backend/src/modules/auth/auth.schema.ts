import { z } from "zod";


export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

export const deleteUserSchema = z.object({
    user_id: z.string().uuid("Invalid user ID"),
});