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
exports.getCompanyInvitesController = exports.acceptInviteController = exports.validateInviteController = exports.sendInviteController = void 0;
const invites_schema_1 = require("./invites.schema");
const invitesService = __importStar(require("./invites.service"));
const response_1 = require("../../lib/response");
const supabase_1 = require("../../lib/supabase");
// POST /api/invites/send
const sendInviteController = async (req, res) => {
    const parsed = invites_schema_1.sendInviteSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const exists = (await supabase_1.supabaseAdmin.auth.admin.listUsers()).data.users.find((u) => u.email == parsed.data.email);
        if (exists)
            return (0, response_1.sendError)(res, "User already exists.");
        const result = await invitesService.sendInvite(parsed.data, req.user.id);
        return (0, response_1.sendSuccess)(res, result, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.sendInviteController = sendInviteController;
// GET /api/invites/validate/:token
const validateInviteController = async (req, res) => {
    const parsed = invites_schema_1.validateInviteSchema.safeParse({ token: req.params.token });
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const result = await invitesService.validateInvite(parsed.data.token);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message, 400);
    }
};
exports.validateInviteController = validateInviteController;
// POST /api/invites/accept
const acceptInviteController = async (req, res) => {
    const parsed = invites_schema_1.acceptInviteSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const result = await invitesService.acceptInvite(parsed.data);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message, 400);
    }
};
exports.acceptInviteController = acceptInviteController;
// GET /api/invites/company/:companyId
const getCompanyInvitesController = async (req, res) => {
    try {
        const result = await invitesService.getCompanyInvites(req.params.companyId);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getCompanyInvitesController = getCompanyInvitesController;
