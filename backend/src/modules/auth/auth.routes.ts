import { Router } from "express";
import { authenticate, authorize } from "./auth.middleware";
import {
    forgotPasswordController,
    deleteUserController,
} from "./auth.controller";

export const authRoutes = Router();

// Public — no auth needed
authRoutes.post("/forgot-password", forgotPasswordController);

authRoutes.delete(
    "/users/:id",
    authenticate,
    authorize("super_admin"),
    deleteUserController,
);
