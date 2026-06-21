"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitesRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const invites_controller_1 = require("./invites.controller");
exports.invitesRoutes = (0, express_1.Router)();
// Public routes — no auth needed
exports.invitesRoutes.get("/validate/:token", invites_controller_1.validateInviteController);
exports.invitesRoutes.post("/accept", invites_controller_1.acceptInviteController);
// Protected routes — super_admin only
exports.invitesRoutes.post("/send", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("super_admin"), invites_controller_1.sendInviteController);
exports.invitesRoutes.get("/company/:companyId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("super_admin"), invites_controller_1.getCompanyInvitesController);
