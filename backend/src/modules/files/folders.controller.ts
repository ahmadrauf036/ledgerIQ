import { Response } from "express";
import { AuthRequest } from "./files.types";
import {
    createFolderSchema,
    updateFolderSchema,
    getFoldersSchema,
} from "./files.schema";
import * as foldersService from "./folders.service";
import { sendSuccess, sendError } from "../../lib/response";

// GET /api/files/folders?company_id=uuid
export const getFolders = async (req: AuthRequest, res: Response) => {
    const parsed = getFoldersSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const folders = await foldersService.getFolders(parsed.data.company_id);
        return sendSuccess(res, folders);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// POST /api/files/folders
export const createFolder = async (req: AuthRequest, res: Response) => {
    const parsed = createFolderSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const folder = await foldersService.createFolder(
            parsed.data,
            req.user!.id,
        );
        return sendSuccess(res, folder, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// PATCH /api/files/folders/:id
export const updateFolder = async (req: AuthRequest, res: Response) => {
    console.log(req.body)
    const parsed = updateFolderSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const folder = await foldersService.updateFolder(
            req.params.id as string,
            parsed.data,
            req.user!.id,
        );
        return sendSuccess(res, folder);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// DELETE /api/files/folders/:id
export const deleteFolder = async (req: AuthRequest, res: Response) => {
    try {
        const result = await foldersService.deleteFolder(
            req.params.id as string,
            req.user!.id,
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
