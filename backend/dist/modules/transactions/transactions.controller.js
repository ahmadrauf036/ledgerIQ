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
exports.getLedger = exports.deleteEntry = exports.postEntry = exports.updateEntry = exports.createEntry = exports.getEntry = exports.getEntries = void 0;
const transactions_schema_1 = require("./transactions.schema");
const transactionsService = __importStar(require("./transactions.service"));
const response_1 = require("../../lib/response");
// GET /api/transactions?company_id=uuid&status=draft
const getEntries = async (req, res) => {
    const parsed = transactions_schema_1.getEntriesSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, status } = parsed.data;
        const entries = await transactionsService.getEntries(company_id, status);
        return (0, response_1.sendSuccess)(res, entries);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getEntries = getEntries;
// GET /api/transactions/:id
const getEntry = async (req, res) => {
    try {
        const entry = await transactionsService.getEntryById(req.params.id);
        if (req.user.role !== "super_admin" &&
            entry.company_id !== req.user.company_id) {
            return (0, response_1.sendError)(res, "You do not have access to this entry", 403);
        }
        return (0, response_1.sendSuccess)(res, entry);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message, 404);
    }
};
exports.getEntry = getEntry;
// POST /api/transactions
const createEntry = async (req, res) => {
    const parsed = transactions_schema_1.createEntrySchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const entry = await transactionsService.createEntry(parsed.data, req.user.id);
        return (0, response_1.sendSuccess)(res, entry, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.createEntry = createEntry;
// PATCH /api/transactions/:id
const updateEntry = async (req, res) => {
    const parsed = transactions_schema_1.updateEntrySchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const existing = await transactionsService.getEntryById(req.params.id);
        if (req.user.role !== "super_admin" &&
            existing.company_id !== req.user.company_id) {
            return (0, response_1.sendError)(res, "You do not have access to this entry", 403);
        }
        const entry = await transactionsService.updateEntry(req.params.id, parsed.data, req.user.id);
        return (0, response_1.sendSuccess)(res, entry);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.updateEntry = updateEntry;
// POST /api/transactions/:id/post
const postEntry = async (req, res) => {
    try {
        const existing = await transactionsService.getEntryById(req.params.id);
        if (req.user.role !== "super_admin" &&
            existing.company_id !== req.user.company_id) {
            return (0, response_1.sendError)(res, "You do not have access to this entry", 403);
        }
        const entry = await transactionsService.postEntry(req.params.id, req.user.id);
        return (0, response_1.sendSuccess)(res, entry);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.postEntry = postEntry;
// DELETE /api/transactions/:id
const deleteEntry = async (req, res) => {
    try {
        const existing = await transactionsService.getEntryById(req.params.id);
        if (req.user.role !== "super_admin" &&
            existing.company_id !== req.user.company_id) {
            return (0, response_1.sendError)(res, "You do not have access to this entry", 403);
        }
        const result = await transactionsService.deleteEntry(req.params.id, req.user.id);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.deleteEntry = deleteEntry;
// GET /api/transactions/ledger/:account_id
const getLedger = async (req, res) => {
    try {
        const ledger = await transactionsService.getLedger(req.params.account_id);
        if (req.user.role !== "super_admin" &&
            ledger.account.company_id !== req.user.company_id) {
            return (0, response_1.sendError)(res, "You do not have access to this ledger", 403);
        }
        return (0, response_1.sendSuccess)(res, ledger);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getLedger = getLedger;
