"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const accounts_controller_1 = require("./accounts.controller");
const scope_middleware_1 = require("../auth/scope.middleware");
exports.accountsRoutes = (0, express_1.Router)();
exports.accountsRoutes.use(auth_middleware_1.authenticate);
// Read — all three roles, scoped to own company
exports.accountsRoutes.get("/", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), scope_middleware_1.enforceCompanyScope, accounts_controller_1.getAccounts);
exports.accountsRoutes.get("/flat", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), scope_middleware_1.enforceCompanyScope, accounts_controller_1.getAccountsFlat);
exports.accountsRoutes.get("/:id", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), accounts_controller_1.getAccount);
// Write — super_admin + bookkeeper only (client_owner is read-only)
exports.accountsRoutes.post("/", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), scope_middleware_1.enforceCompanyScope, accounts_controller_1.createAccount);
exports.accountsRoutes.patch("/:id", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), accounts_controller_1.updateAccount);
exports.accountsRoutes.delete("/:id", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), accounts_controller_1.deactivateAccount);
exports.accountsRoutes.post("/seed/:company_id", (0, auth_middleware_1.authorize)("super_admin"), // seeding only happens on client creation by ACCA
accounts_controller_1.seedAccounts);
