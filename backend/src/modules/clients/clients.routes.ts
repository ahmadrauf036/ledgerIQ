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

clientsRoutes.use(authenticate);
clientsRoutes.use(authorize("super_admin"));

clientsRoutes.get("/", getClients);
clientsRoutes.get("/:id", getClient);
clientsRoutes.post("/", createClient);
clientsRoutes.patch("/:id", updateClient);
clientsRoutes.delete("/:id", deactivateClient);
