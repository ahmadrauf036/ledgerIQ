"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLogSchema = exports.getAuditLogsSchema = void 0;
const zod_1 = require("zod");
const auditActionEnum = zod_1.z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "POST",
    "DEACTIVATE",
    "ACTIVATE",
    "INVITE",
]);
exports.getAuditLogsSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid().optional(),
    user_id: zod_1.z.string().uuid().optional(),
    table_name: zod_1.z.string().optional(),
    action: auditActionEnum.optional(),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
    page: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v) : 50)),
});
exports.createAuditLogSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid().nullable().optional(),
    action: auditActionEnum,
    table_name: zod_1.z.string().min(1),
    record_id: zod_1.z.string().nullable().optional(),
    old_data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
    new_data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
});
