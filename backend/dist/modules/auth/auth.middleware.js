"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const supabase_1 = require("../../lib/supabase");
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    const { data: { user }, error, } = await supabase_1.supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = {
        id: user.id,
        email: user.email,
        role: user.app_metadata?.role,
    };
    next();
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};
exports.authorize = authorize;
