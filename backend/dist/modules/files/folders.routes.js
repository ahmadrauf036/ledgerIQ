"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foldersRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const folders_controller_1 = require("./folders.controller");
exports.foldersRoutes = (0, express_1.Router)();
exports.foldersRoutes.use(auth_middleware_1.authenticate);
exports.foldersRoutes.use((0, auth_middleware_1.authorize)("super_admin")); // expand later for client_owner/bookkeeper
exports.foldersRoutes.get("/", folders_controller_1.getFolders);
exports.foldersRoutes.post("/", folders_controller_1.createFolder);
exports.foldersRoutes.patch("/:id", folders_controller_1.updateFolder);
exports.foldersRoutes.delete("/:id", folders_controller_1.deleteFolder);
