import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
    sendInviteController,
    validateInviteController,
    acceptInviteController,
    getCompanyInvitesController,
} from "./invites.controller";

export const invitesRoutes = Router();

// Public routes — no auth needed
invitesRoutes.get("/validate/:token", validateInviteController);
invitesRoutes.post("/accept", acceptInviteController);

// Protected routes — super_admin only
invitesRoutes.post(
    "/send",
    authenticate,
    authorize("super_admin"),
    sendInviteController,
);

invitesRoutes.get(
    "/company/:companyId",
    authenticate,
    authorize("super_admin"),
    getCompanyInvitesController,
);
