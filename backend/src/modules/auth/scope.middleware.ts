import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.types";

/**
 * Enforces that client_owner and bookkeeper can only access
 * their OWN company's data. super_admin is unrestricted.
 *
 * Behavior:
 *  - super_admin: passes through unchanged
 *  - client_owner / bookkeeper:
 *      - if no company_id provided in query/body → auto-injects their own
 *      - if company_id provided and matches their own → allowed
 *      - if company_id provided and does NOT match → 403 Forbidden
 */
export const enforceCompanyScope = (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Super admin — no restriction
    if (req.user.role === "super_admin") {
        return next();
    }

    // client_owner / bookkeeper must have a company_id on their account
    if (!req.user.company_id) {
        return res.status(403).json({
            error: "Your account is not linked to a company",
        });
    }

    const ownCompanyId = req.user.company_id;

    // Check query param (GET requests)
    const queryCompanyId = req.query.company_id as string | undefined;
    if (queryCompanyId !== undefined) {
        if (queryCompanyId !== ownCompanyId) {
            return res.status(403).json({
                error: "You do not have access to this company's data",
            });
        }
    } else {
        // Auto-inject for convenience so downstream code always has it
        req.query.company_id = ownCompanyId;
    }

    // Check body param (POST/PATCH requests)
    if (req.body && typeof req.body === "object") {
        if (req.body.company_id !== undefined) {
            if (req.body.company_id !== ownCompanyId) {
                return res.status(403).json({
                    error: "You do not have access to this company's data",
                });
            }
        } else if (req.method === "POST" || req.method === "PATCH") {
            // Auto-inject on writes too, if the route expects it in body
            req.body.company_id = ownCompanyId;
        }
    }

    next();
};
