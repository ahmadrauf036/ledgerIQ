import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
} from "./folders.controller";

export const foldersRoutes = Router();

foldersRoutes.use(authenticate);
foldersRoutes.use(authorize("super_admin")); // expand later for client_owner/bookkeeper

foldersRoutes.get("/", getFolders);
foldersRoutes.post("/", createFolder);
foldersRoutes.patch("/:id", updateFolder);
foldersRoutes.delete("/:id", deleteFolder);
