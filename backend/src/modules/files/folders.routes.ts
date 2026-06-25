import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { enforceCompanyScope } from "../auth/scope.middleware";
import {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
} from "./folders.controller";

export const foldersRoutes = Router();

foldersRoutes.use(authenticate);

foldersRoutes.get(
    "/",
    authorize("super_admin", "client_owner", "bookkeeper"),
    enforceCompanyScope,
    getFolders,
);
foldersRoutes.post(
    "/",
    authorize("super_admin", "client_owner", "bookkeeper"),
    enforceCompanyScope,
    createFolder,
);
foldersRoutes.patch(
    "/:id",
    authorize("super_admin", "client_owner", "bookkeeper"),
    updateFolder,
);
foldersRoutes.delete(
    "/:id",
    authorize("super_admin", "client_owner", "bookkeeper"),
    deleteFolder,
);
