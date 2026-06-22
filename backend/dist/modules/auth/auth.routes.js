"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("./auth.middleware");
const auth_controller_1 = require("./auth.controller");
exports.authRoutes = (0, express_1.Router)();
// Public — no auth needed
exports.authRoutes.post("/forgot-password", auth_controller_1.forgotPasswordController);
exports.authRoutes.delete("/users/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("super_admin"), auth_controller_1.deleteUserController);
