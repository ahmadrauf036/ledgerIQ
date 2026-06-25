"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const scope_middleware_1 = require("../auth/scope.middleware");
const transactions_controller_1 = require("./transactions.controller");
exports.transactionsRoutes = (0, express_1.Router)();
exports.transactionsRoutes.use(auth_middleware_1.authenticate);
// Read — all three roles, scoped
exports.transactionsRoutes.get("/", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), scope_middleware_1.enforceCompanyScope, transactions_controller_1.getEntries);
exports.transactionsRoutes.get("/ledger/:account_id", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), transactions_controller_1.getLedger);
exports.transactionsRoutes.get("/:id", (0, auth_middleware_1.authorize)("super_admin", "client_owner", "bookkeeper"), transactions_controller_1.getEntry);
// Write — super_admin + bookkeeper only
exports.transactionsRoutes.post("/", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), scope_middleware_1.enforceCompanyScope, transactions_controller_1.createEntry);
exports.transactionsRoutes.patch("/:id", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), transactions_controller_1.updateEntry);
exports.transactionsRoutes.post("/:id/post", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), transactions_controller_1.postEntry);
exports.transactionsRoutes.delete("/:id", (0, auth_middleware_1.authorize)("super_admin", "bookkeeper"), transactions_controller_1.deleteEntry);
