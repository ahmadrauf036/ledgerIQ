import { Response } from "express";
import { AuthRequest } from "./invites.types";
import {
    sendInviteSchema,
    validateInviteSchema,
    acceptInviteSchema,
} from "./invites.schema";
import * as invitesService from "./invites.service";
import { sendSuccess, sendError } from "../../lib/response";

// POST /api/invites/send
export const sendInviteController = async (req: AuthRequest, res: Response) => {
    const parsed = sendInviteSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await invitesService.sendInvite(
            parsed.data,
            req.user!.id,
        );
        return sendSuccess(res, result, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/invites/validate/:token
export const validateInviteController = async (
    req: AuthRequest,
    res: Response,
) => {
    const parsed = validateInviteSchema.safeParse({ token: req.params.token });
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await invitesService.validateInvite(parsed.data.token);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message, 400);
    }
};

// POST /api/invites/accept
export const acceptInviteController = async (
    req: AuthRequest,
    res: Response,
) => {
    const parsed = acceptInviteSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await invitesService.acceptInvite(parsed.data);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message, 400);
    }
};

// GET /api/invites/company/:companyId
export const getCompanyInvitesController = async (
    req: AuthRequest,
    res: Response,
) => {
    try {
        const result = await invitesService.getCompanyInvites(
            req.params.companyId as string,
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
