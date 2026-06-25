import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { enforceCompanyScope } from "../auth/scope.middleware";
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

filesRoutes.get(
    "/",
    authorize("super_admin", "client_owner", "bookkeeper"),
    enforceCompanyScope,
    getFiles,
);
filesRoutes.post(
    "/upload",
    authorize("super_admin", "client_owner", "bookkeeper"),
    uploadMiddleware.single("file"),
    enforceCompanyScope, // runs AFTER multer parses the body, so req.body.company_id exists
    uploadFile,
);
filesRoutes.get(
    "/:id/preview",
    authorize("super_admin", "client_owner", "bookkeeper"),
    getPreviewUrl,
);
filesRoutes.get(
    "/:id/download",
    authorize("super_admin", "client_owner", "bookkeeper"),
    getDownloadUrl,
);
filesRoutes.delete(
    "/:id",
    authorize("super_admin", "client_owner", "bookkeeper"),
    deleteFile,
);
