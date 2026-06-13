import { z } from "zod";

export const createClientSchema = z.object({
    company_name: z.string().min(1, "Company name is required"),
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().optional(),
    address: z.string().optional(),
    ntn_number: z.string().optional(),
    financial_year_start: z.number().min(1).max(12),
    currency: z.enum(["PKR", "USD"]),
});

export type CreateClientForm = z.infer<typeof createClientSchema>;
