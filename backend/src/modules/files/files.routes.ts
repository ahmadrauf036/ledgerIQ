import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { uploadMiddleware } from "./files.middleware";
import {
    getFiles,
    uploadFile,
    getPreviewUrl,
    getDownloadUrl,
    deleteFile,
} from "./files.controller";

export const filesRoutes = Router();

filesRoutes.use(authenticate);
filesRoutes.use(authorize("super_admin")); // expand later for client_owner/bookkeeper

filesRoutes.get("/", getFiles);
filesRoutes.post("/upload", uploadMiddleware.single("file"), uploadFile);
filesRoutes.get("/:id/preview", getPreviewUrl);
filesRoutes.get("/:id/download", getDownloadUrl);
filesRoutes.delete("/:id", deleteFile);
