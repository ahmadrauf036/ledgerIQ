import { Router } from "express";
import { authenticate, authorize } from "./auth.middleware";
import {
    inviteUserController,
    forgotPasswordController,
    deleteUserController,
} from "./auth.controller";

export const authRoutes = Router();

// Public — no auth needed
authRoutes.post("/forgot-password", forgotPasswordController);

// Super admin only
authRoutes.post(
    "/invite",
    authenticate,
    authorize("super_admin"),
    inviteUserController,
);

authRoutes.delete(
    "/users/:id",
    authenticate,
    authorize("super_admin"),
    deleteUserController,
);