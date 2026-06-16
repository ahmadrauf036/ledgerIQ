import { Request } from "express";

export type InviteStatus = "pending" | "accepted" | "expired";
export type UserRole = "client_owner" | "bookkeeper" | "super_admin";

export interface Invite {
    id: string;
    company_id: string;
    invited_by: string | null;
    email: string;
    role: UserRole;
    token: string;
    status: InviteStatus;
    expires_at: string;
    created_at: string;
}

export interface ValidateInviteResponse {
    invite: Invite;
    company_name: string;
    email: string;
    role: UserRole;
}

export interface AcceptInviteBody {
    token: string;
    password: string;
    full_name: string;
}

export interface SendInviteBody {
    email: string;
    role: UserRole;
    company_id: string;
    full_name?: string  
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
    };
}
