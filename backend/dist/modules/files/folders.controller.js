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
exports.deleteFolder = exports.updateFolder = exports.createFolder = exports.getFolders = void 0;
const files_schema_1 = require("./files.schema");
const foldersService = __importStar(require("./folders.service"));
const response_1 = require("../../lib/response");
// GET /api/files/folders?company_id=uuid
const getFolders = async (req, res) => {
    const parsed = files_schema_1.getFoldersSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const folders = await foldersService.getFolders(parsed.data.company_id);
        return (0, response_1.sendSuccess)(res, folders);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getFolders = getFolders;
// POST /api/files/folders
const createFolder = async (req, res) => {
    const parsed = files_schema_1.createFolderSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const folder = await foldersService.createFolder(parsed.data, req.user.id);
        return (0, response_1.sendSuccess)(res, folder, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.createFolder = createFolder;
// PATCH /api/files/folders/:id
const updateFolder = async (req, res) => {
    console.log(req.body);
    const parsed = files_schema_1.updateFolderSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const folder = await foldersService.updateFolder(req.params.id, parsed.data, req.user.id);
        return (0, response_1.sendSuccess)(res, folder);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.updateFolder = updateFolder;
// DELETE /api/files/folders/:id
const deleteFolder = async (req, res) => {
    try {
        const result = await foldersService.deleteFolder(req.params.id, req.user.id);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.deleteFolder = deleteFolder;
