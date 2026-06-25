"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const scope_middleware_1 = require("../auth/scope.middleware");
const reports_controller_1 = require("./reports.controller");
exports.reportsRoutes = (0, express_1.Router)();
exports.reportsRoutes.use(auth_middleware_1.authenticate);
// Read only — super_admin + client_owner (bookkeeper excluded per access matrix)
exports.reportsRoutes.get("/trial-balance", (0, auth_middleware_1.authorize)("super_admin", "client_owner"), scope_middleware_1.enforceCompanyScope, reports_controller_1.getTrialBalance);
exports.reportsRoutes.get("/profit-loss", (0, auth_middleware_1.authorize)("super_admin", "client_owner"), scope_middleware_1.enforceCompanyScope, reports_controller_1.getProfitLoss);
exports.reportsRoutes.get("/balance-sheet", (0, auth_middleware_1.authorize)("super_admin", "client_owner"), scope_middleware_1.enforceCompanyScope, reports_controller_1.getBalanceSheet);
