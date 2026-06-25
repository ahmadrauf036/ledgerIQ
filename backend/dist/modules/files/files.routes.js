"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const scope_middleware_1 = require("../auth/scope.middleware");
const files_middleware_1 = require("./files.middleware");
const files_controller_1 = require("./files.controller");
exports.filesRoutes = (0, express_1.Router)();
exports.filesRoutes.use(auth_middleware_1.authenticate);
exports.filesRoutes.get("/", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), scope_middleware_1.enforceCompanyScope, files_controller_1.getFiles);
exports.filesRoutes.post("/upload", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), files_middleware_1.uploadMiddleware.single("file"), scope_middleware_1.enforceCompanyScope, // runs AFTER multer parses the body, so req.body.company_id exists
files_controller_1.uploadFile);
exports.filesRoutes.get("/:id/preview", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), files_controller_1.getPreviewUrl);
exports.filesRoutes.get("/:id/download", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), files_controller_1.getDownloadUrl);
exports.filesRoutes.delete("/:id", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), files_controller_1.deleteFile);
