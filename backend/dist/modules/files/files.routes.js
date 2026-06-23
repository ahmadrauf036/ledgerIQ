"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const files_middleware_1 = require("./files.middleware");
const files_controller_1 = require("./files.controller");
exports.filesRoutes = (0, express_1.Router)();
exports.filesRoutes.use(auth_middleware_1.authenticate);
exports.filesRoutes.use((0, auth_middleware_1.authorize)("super_admin")); // expand later for client_owner/bookkeeper
exports.filesRoutes.get("/", files_controller_1.getFiles);
exports.filesRoutes.post("/upload", files_middleware_1.uploadMiddleware.single("file"), files_controller_1.uploadFile);
exports.filesRoutes.get("/:id/preview", files_controller_1.getPreviewUrl);
exports.filesRoutes.get("/:id/download", files_controller_1.getDownloadUrl);
exports.filesRoutes.delete("/:id", files_controller_1.deleteFile);
