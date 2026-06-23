"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterOptions = exports.getRecordHistory = exports.getAuditLogs = void 0;
const audit_schema_1 = require("./audit.schema");
const auditService = __importStar(require("./audit.service"));
const response_1 = require("../../lib/response");
// GET /api/audit?company_id=&user_id=&table_name=&action=&start_date=&end_date=&page=&limit=
const getAuditLogs = async (req, res) => {
    const parsed = audit_schema_1.getAuditLogsSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const result = await auditService.getAuditLogs(parsed.data);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getAuditLogs = getAuditLogs;
// GET /api/audit/record/:table_name/:record_id
const getRecordHistory = async (req, res) => {
    try {
        const { table_name, record_id } = req.params;
        const history = await auditService.getRecordHistory(table_name, record_id);
        return (0, response_1.sendSuccess)(res, history);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getRecordHistory = getRecordHistory;
// GET /api/audit/filters
const getFilterOptions = async (req, res) => {
    try {
        const options = await auditService.getFilterOptions();
        return (0, response_1.sendSuccess)(res, options);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getFilterOptions = getFilterOptions;
