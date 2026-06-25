import { Response, NextFunction } from "express";
import { supabase } from "../../lib/supabase";
import { AuthRequest } from "./auth.types";

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = {
        id: user.id,
        email: user.email!,
        role: user.app_metadata?.role,
        company_id: user.app_metadata?.company_id ?? null, // ← added
    };

    next();
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};
