"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileMetadataSchema = exports.getFilesSchema = exports.getFoldersSchema = exports.updateFolderSchema = exports.createFolderSchema = void 0;
const zod_1 = require("zod");
exports.createFolderSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    name: zod_1.z
        .string()
        .min(1, "Folder name is required")
        .max(100, "Folder name too long"),
});
exports.updateFolderSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Folder name is required")
        .max(100, "Folder name too long"),
});
exports.getFoldersSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
});
exports.getFilesSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    folder_id: zod_1.z.string().uuid().optional(),
});
exports.uploadFileMetadataSchema = zod_1.z.object({
    company_id: zod_1.z.string().uuid("Invalid company ID"),
    folder_id: zod_1.z.string().uuid().optional().or(zod_1.z.literal("")),
    description: zod_1.z.string().max(255).optional(),
});
