"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getDownloadUrl = exports.getPreviewUrl = exports.uploadFile = exports.getFiles = void 0;
const files_schema_1 = require("./files.schema");
const filesService = __importStar(require("./files.service"));
const response_1 = require("../../lib/response");
// GET /api/files?company_id=uuid&folder_id=uuid
const getFiles = async (req, res) => {
    const parsed = files_schema_1.getFilesSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, folder_id } = parsed.data;
        const files = await filesService.getFiles(company_id, folder_id);
        return (0, response_1.sendSuccess)(res, files);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getFiles = getFiles;
// POST /api/files/upload (multipart/form-data)
const uploadFile = async (req, res) => {
    if (!req.file) {
        return (0, response_1.sendError)(res, "No file provided");
    }
    const parsed = files_schema_1.uploadFileMetadataSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, folder_id, description } = parsed.data;
        const file = await filesService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, req.file.size, {
            company_id,
            folder_id: folder_id || null,
            description,
        }, req.user.id);
        return (0, response_1.sendSuccess)(res, file, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.uploadFile = uploadFile;
// GET /api/files/:id/preview
const getPreviewUrl = async (req, res) => {
    try {
        const result = await filesService.getPreviewUrl(req.params.id);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getPreviewUrl = getPreviewUrl;
// GET /api/files/:id/download
const getDownloadUrl = async (req, res) => {
    try {
        const result = await filesService.getDownloadUrl(req.params.id);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getDownloadUrl = getDownloadUrl;
// DELETE /api/files/:id
const deleteFile = async (req, res) => {
    try {
        const isAdmin = req.user.role === "super_admin";
        const result = await filesService.deleteFile(req.params.id, req.user.id, isAdmin);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.deleteFile = deleteFile;
