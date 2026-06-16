import { Response } from "express";
import { AuthRequest } from "./accounts.types";
import {
    createAccountSchema,
    updateAccountSchema,
    getAccountsSchema,
} from "./accounts.schema";
import * as accountsService from "./accounts.service";
import { sendSuccess, sendError } from "../../lib/response";

// GET /api/accounts?company_id=uuid&type=asset
export const getAccounts = async (req: AuthRequest, res: Response) => {
    const parsed = getAccountsSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, type } = parsed.data;
        const accounts = await accountsService.getAccountsTree(
            company_id,
            type,
        );
        return sendSuccess(res, accounts);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/accounts/flat?company_id=uuid&type=asset
export const getAccountsFlat = async (req: AuthRequest, res: Response) => {
    const parsed = getAccountsSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, type } = parsed.data;
        const accounts = await accountsService.getAccounts(company_id, type);
        return sendSuccess(res, accounts);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/accounts/:id
export const getAccount = async (req: AuthRequest, res: Response) => {
    try {
        const account = await accountsService.getAccountById(req.params.id as string);
        return sendSuccess(res, account);
    } catch (err) {
        return sendError(res, (err as Error).message, 404);
    }
};

// POST /api/accounts
export const createAccount = async (req: AuthRequest, res: Response) => {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const account = await accountsService.createAccount(parsed.data);
        return sendSuccess(res, account, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// PATCH /api/accounts/:id
export const updateAccount = async (req: AuthRequest, res: Response) => {
    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const account = await accountsService.updateAccount(
            req.params.id  as string,
            parsed.data,
        );
        return sendSuccess(res, account);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// DELETE /api/accounts/:id
export const deactivateAccount = async (req: AuthRequest, res: Response) => {
    try {
        const account = await accountsService.deactivateAccount(req.params.id as string);
        return sendSuccess(res, account);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// POST /api/accounts/seed/:company_id
export const seedAccounts = async (req: AuthRequest, res: Response) => {
    try {
        const result = await accountsService.seedAccounts(
            req.params.company_id as string,
        );
        return sendSuccess(res, result, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
