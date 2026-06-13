import { Request } from "express";

export type UserRole = "super_admin" | "client_owner" | "bookkeeper";

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}
