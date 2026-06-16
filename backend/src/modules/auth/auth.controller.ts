import { Response } from "express";
import { AuthRequest } from "./auth.types";
import {
    inviteUserSchema,
    forgotPasswordSchema,
    deleteUserSchema,
} from "./auth.schema";
import * as authService from "./auth.service";
import { sendSuccess, sendError } from "../../lib/response";

export const inviteUserController = async (req: AuthRequest, res: Response) => {
    const parsed = inviteUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const user = await authService.inviteUser(
            parsed.data.email,
            parsed.data.role,
            parsed.data.company_id,
        );
        return sendSuccess(res, { user }, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};


export const deleteUserController = async (req: AuthRequest, res: Response) => {
    const parsed = deleteUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await authService.deleteUser(parsed.data.user_id);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
export const forgotPasswordController = async (
    req: AuthRequest,
    res: Response,
) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await authService.sendPasswordResetEmail(
            parsed.data.email,
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};