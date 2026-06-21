"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const accounts_controller_1 = require("./accounts.controller");
exports.accountsRoutes = (0, express_1.Router)();
// All routes require authentication
exports.accountsRoutes.use(auth_middleware_1.authenticate);
// Super admin only
exports.accountsRoutes.use((0, auth_middleware_1.authorize)("super_admin"));
exports.accountsRoutes.get("/", accounts_controller_1.getAccounts);
exports.accountsRoutes.get("/flat", accounts_controller_1.getAccountsFlat);
exports.accountsRoutes.get("/:id", accounts_controller_1.getAccount);
exports.accountsRoutes.post("/", accounts_controller_1.createAccount);
exports.accountsRoutes.patch("/:id", accounts_controller_1.updateAccount);
exports.accountsRoutes.delete("/:id", accounts_controller_1.deactivateAccount);
exports.accountsRoutes.post("/seed/:company_id", accounts_controller_1.seedAccounts);
