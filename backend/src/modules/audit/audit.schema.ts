import { z } from "zod";

const auditActionEnum = z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "POST",
    "DEACTIVATE",
    "ACTIVATE",
    "INVITE",
]);

export const getAuditLogsSchema = z.object({
    company_id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    table_name: z.string().optional(),
    action: auditActionEnum.optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v) : 1)),
    limit: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v) : 50)),
});

export const createAuditLogSchema = z.object({
    company_id: z.string().uuid().nullable().optional(),
    action: auditActionEnum,
    table_name: z.string().min(1),
    record_id: z.string().nullable().optional(),
    old_data: z.record(z.string(), z.unknown()).nullable().optional(),
    new_data: z.record(z.string(), z.unknown()).nullable().optional(),
});
