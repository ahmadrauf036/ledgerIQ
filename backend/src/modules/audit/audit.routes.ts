import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
    getAuditLogs,
    getRecordHistory,
    getFilterOptions,
} from "./audit.controller";

export const auditRoutes = Router();

auditRoutes.use(authenticate);
auditRoutes.use(authorize("super_admin"));

auditRoutes.get("/", getAuditLogs);
auditRoutes.get("/filters", getFilterOptions);
auditRoutes.get("/record/:table_name/:record_id", getRecordHistory);
