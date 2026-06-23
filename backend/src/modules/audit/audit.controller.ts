import { Response } from "express";
import { AuthRequest } from "./audit.types";
import { getAuditLogsSchema } from "./audit.schema";
import * as auditService from "./audit.service";
import { sendSuccess, sendError } from "../../lib/response";

// GET /api/audit?company_id=&user_id=&table_name=&action=&start_date=&end_date=&page=&limit=
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    const parsed = getAuditLogsSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await auditService.getAuditLogs(parsed.data);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/audit/record/:table_name/:record_id
export const getRecordHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { table_name, record_id } = req.params;
        const history = await auditService.getRecordHistory(
            table_name as string,
            record_id as string,
        );
        return sendSuccess(res, history);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/audit/filters
export const getFilterOptions = async (req: AuthRequest, res: Response) => {
    try {
        const options = await auditService.getFilterOptions();
        return sendSuccess(res, options);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
