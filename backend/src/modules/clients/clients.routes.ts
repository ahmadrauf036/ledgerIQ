import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
    getClients,
    getClient,
    createClient,
    updateClient,
    deactivateClient,
} from "./clients.controller";

export const clientsRoutes = Router();

// All routes require authentication
clientsRoutes.use(authenticate);

// All routes require super_admin
clientsRoutes.use(authorize("super_admin"));

clientsRoutes.get("/", getClients);
clientsRoutes.get("/:id", getClient);
clientsRoutes.post("/", createClient);
clientsRoutes.patch("/:id", updateClient);
clientsRoutes.delete("/:id", deactivateClient);
