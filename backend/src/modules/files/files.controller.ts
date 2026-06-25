import { Response } from "express";
import { AuthRequest } from "./files.types";
import { getFilesSchema, uploadFileMetadataSchema } from "./files.schema";
import * as filesService from "./files.service";
import { sendSuccess, sendError } from "../../lib/response";

// GET /api/files?company_id=uuid&folder_id=uuid
export const getFiles = async (req: AuthRequest, res: Response) => {
    const parsed = getFilesSchema.safeParse(req.query);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, folder_id } = parsed.data;
        const files = await filesService.getFiles(company_id, folder_id);
        return sendSuccess(res, files);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// POST /api/files/upload (multipart/form-data)
export const uploadFile = async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return sendError(res, "No file provided");
    }

    const parsed = uploadFileMetadataSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }

    try {
        const { company_id, folder_id, description } = parsed.data;

        const file = await filesService.uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            req.file.size,
            {
                company_id,
                folder_id: folder_id || null,
                description,
            },
            req.user!.id,
        );

        return sendSuccess(res, file, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/files/:id/preview (in files.controller.ts)
export const getPreviewUrl = async (req: AuthRequest, res: Response) => {
    try {
        const file = await filesService.getFileById(req.params.id as string);

        if (
            req.user!.role !== "super_admin" &&
            file.company_id !== req.user!.company_id
        ) {
            return sendError(res, "You do not have access to this file", 403);
        }

        const result = await filesService.getPreviewUrl(
            req.params.id as string,
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/files/:id/download
export const getDownloadUrl = async (req: AuthRequest, res: Response) => {
    try {
        const file = await filesService.getFileById(req.params.id as string);

        if (
            req.user!.role !== "super_admin" &&
            file.company_id !== req.user!.company_id
        ) {
            return sendError(res, "You do not have access to this file", 403);
        }

        const result = await filesService.getDownloadUrl(
            req.params.id as string,
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// DELETE /api/files/:id
export const deleteFile = async (req: AuthRequest, res: Response) => {
    try {
        const isAdmin = req.user!.role === "super_admin";
        const result = await filesService.deleteFile(
            req.params.id as string,
            req.user!.id,
            isAdmin,
            req.user!.company_id, // ← pass it through
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};