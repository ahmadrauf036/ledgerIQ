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
exports.deactivateClient = exports.updateClient = exports.createClient = exports.getClient = exports.getClients = void 0;
const clients_schema_1 = require("./clients.schema");
const clientsService = __importStar(require("./clients.service"));
const response_1 = require("../../lib/response");
// GET /api/clients
const getClients = async (req, res) => {
    try {
        const clients = await clientsService.getAllClients();
        return (0, response_1.sendSuccess)(res, clients);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getClients = getClients;
// GET /api/clients/:id
const getClient = async (req, res) => {
    try {
        const client = await clientsService.getClientById(req.params.id);
        return (0, response_1.sendSuccess)(res, client);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message, 404);
    }
};
exports.getClient = getClient;
// POST /api/clients
const createClient = async (req, res) => {
    const parsed = clients_schema_1.createClientSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const result = await clientsService.createClient(parsed.data, req.user.id);
        return (0, response_1.sendSuccess)(res, result, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.createClient = createClient;
// PATCH /api/clients/:id
const updateClient = async (req, res) => {
    const parsed = clients_schema_1.updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const result = await clientsService.updateClient(req.params.id, parsed.data);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.updateClient = updateClient;
// DELETE /api/clients/:id
const deactivateClient = async (req, res) => {
    try {
        const result = await clientsService.deactivateClient(req.params.id);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.deactivateClient = deactivateClient;
