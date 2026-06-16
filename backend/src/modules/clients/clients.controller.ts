import { Response } from "express";
import { AuthRequest } from "./clients.types";
import { createClientSchema, updateClientSchema } from "./clients.schema";
import * as clientsService from "./clients.service";
import { sendSuccess, sendError } from "../../lib/response";

// GET /api/clients
export const getClients = async (req: AuthRequest, res: Response) => {
    try {
        const clients = await clientsService.getAllClients();
        return sendSuccess(res, clients);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// GET /api/clients/:id
export const getClient = async (req: AuthRequest, res: Response) => {
    try {
        const client = await clientsService.getClientById(req.params.id as string);
        return sendSuccess(res, client);
    } catch (err) {
        return sendError(res, (err as Error).message, 404);
    }
};

// POST /api/clients
export const createClient = async (req: AuthRequest, res: Response) => {
    const parsed = createClientSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }
    try {
        const result = await clientsService.createClient(
            parsed.data,
            req.user!.id, // ← pass invitedBy
        );
        return sendSuccess(res, result, 201);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// PATCH /api/clients/:id
export const updateClient = async (req: AuthRequest, res: Response) => {
    const parsed = updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.issues[0].message);
    }

    try {
        const result = await clientsService.updateClient(
            req.params.id as string,
            parsed.data,
        );
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};

// DELETE /api/clients/:id
export const deactivateClient = async (req: AuthRequest, res: Response) => {
    try {
        const result = await clientsService.deactivateClient(req.params.id as string);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, (err as Error).message);
    }
};
