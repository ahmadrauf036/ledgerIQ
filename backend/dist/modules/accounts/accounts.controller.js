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
exports.seedAccounts = exports.deactivateAccount = exports.updateAccount = exports.createAccount = exports.getAccount = exports.getAccountsFlat = exports.getAccounts = void 0;
const accounts_schema_1 = require("./accounts.schema");
const accountsService = __importStar(require("./accounts.service"));
const response_1 = require("../../lib/response");
// GET /api/accounts?company_id=uuid&type=asset
const getAccounts = async (req, res) => {
    const parsed = accounts_schema_1.getAccountsSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, type } = parsed.data;
        const accounts = await accountsService.getAccountsTree(company_id, type);
        return (0, response_1.sendSuccess)(res, accounts);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getAccounts = getAccounts;
// GET /api/accounts/flat?company_id=uuid&type=asset
const getAccountsFlat = async (req, res) => {
    const parsed = accounts_schema_1.getAccountsSchema.safeParse(req.query);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const { company_id, type } = parsed.data;
        const accounts = await accountsService.getAccounts(company_id, type);
        return (0, response_1.sendSuccess)(res, accounts);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.getAccountsFlat = getAccountsFlat;
// GET /api/accounts/:id
const getAccount = async (req, res) => {
    try {
        const account = await accountsService.getAccountById(req.params.id);
        return (0, response_1.sendSuccess)(res, account);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message, 404);
    }
};
exports.getAccount = getAccount;
// POST /api/accounts
const createAccount = async (req, res) => {
    const parsed = accounts_schema_1.createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const account = await accountsService.createAccount(parsed.data);
        return (0, response_1.sendSuccess)(res, account, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.createAccount = createAccount;
// PATCH /api/accounts/:id
const updateAccount = async (req, res) => {
    const parsed = accounts_schema_1.updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return (0, response_1.sendError)(res, parsed.error.issues[0].message);
    }
    try {
        const account = await accountsService.updateAccount(req.params.id, parsed.data);
        return (0, response_1.sendSuccess)(res, account);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.updateAccount = updateAccount;
// DELETE /api/accounts/:id
const deactivateAccount = async (req, res) => {
    try {
        const account = await accountsService.deactivateAccount(req.params.id);
        return (0, response_1.sendSuccess)(res, account);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.deactivateAccount = deactivateAccount;
// POST /api/accounts/seed/:company_id
const seedAccounts = async (req, res) => {
    try {
        const result = await accountsService.seedAccounts(req.params.company_id);
        return (0, response_1.sendSuccess)(res, result, 201);
    }
    catch (err) {
        return (0, response_1.sendError)(res, err.message);
    }
};
exports.seedAccounts = seedAccounts;
// # Create account
// POST http://localhost:5000/api/accounts
// Authorization: Bearer <token>
// {
//   "company_id": "uuid",
//   "code": "1115",
//   "name": "Petty Cash",
//   "type": "asset",
//   "parent_id": "uuid-of-1100"
// }
// # Update account
// PATCH http://localhost:5000/api/accounts/:id
// Authorization: Bearer <token>
// {
//   "name": "Updated Name"
// }
// # Deactivate account
// DELETE http://localhost:5000/api/accounts/:id
// Authorization: Bearer <token>
