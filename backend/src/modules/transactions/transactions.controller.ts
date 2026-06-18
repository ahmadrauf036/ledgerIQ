import { Response } from "express";
import { AuthRequest } from "./transactions.types";
import {
    createEntrySchema,
    updateEntrySchema,
    getEntriesSchema,
} from "./transactions.schema";
import * as transactionsService from "./transactions.service";
import { sendSuccess, sendError } from "../../lib/response";

// GET /api/transactions?company_id=uuid&status=draft
export const getEntries = async (req: AuthRequest, res: Response) => {
    const parsed = getEntriesSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, status } = parsed.data;
        const entries = await transactionsService.getEntries(
            company_id,
            status,
        );
        return sendSuccess(res, entries);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/transactions/:id
export const getEntry = async (req: AuthRequest, res: Response) => {
    try {
        const entry = await transactionsService.getEntryById(req.params.id as string);
        return sendSuccess(res, entry);
    } catch (err) {
        return sendError(res, (err as Error).message, 404);
    }
};

// POST /api/transactions
export const createEntry = async (req: AuthRequest, res: Response) => {
    const parsed = createEntrySchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const entry = await transactionsService.createEntry(
            parsed.data,
            req.user!.id,
        );
        return sendSuccess(res, entry, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// PATCH /api/transactions/:id
export const updateEntry = async (req: AuthRequest, res: Response) => {
    const parsed = updateEntrySchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const entry = await transactionsService.updateEntry(
            req.params.id as string,
            parsed.data,
        );
        return sendSuccess(res, entry);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// POST /api/transactions/:id/post
export const postEntry = async (req: AuthRequest, res: Response) => {
    try {
        const entry = await transactionsService.postEntry(req.params.id as string);
        return sendSuccess(res, entry);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// DELETE /api/transactions/:id
export const deleteEntry = async (req: AuthRequest, res: Response) => {
    try {
        const result = await transactionsService.deleteEntry(req.params.id as string);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/transactions/ledger/:account_id
export const getLedger = async (req: AuthRequest, res: Response) => {
    try {
        const ledger = await transactionsService.getLedger(
            req.params.account_id as string,
        );
        return sendSuccess(res, ledger);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
