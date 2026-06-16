import { supabaseAdmin } from "../../lib/supabase";
import { Resend } from "resend";
import type { SendInviteBody, AcceptInviteBody } from "./invites.types";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Send invite email via Resend ─────────────────
const sendInviteEmail = async (
    email: string,
    companyName: string,
    token: string,
    role: string,
    fullName: string = "",
) => {
    const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
    const roleLabel = role === "client_owner" ? "Client" : "Bookkeeper";

    const { error } = await resend.emails.send({
        from: `LedgerIQ <${process.env.RESEND_FROM_EMAIL}>`,
        to: process.env.TEST_EMAIL ?? email,
        subject: `You have been invited to LedgerIQ`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <div style="margin-bottom: 24px;">
                    <h2 style="color: #10b981; margin: 0 0 4px;">LedgerIQ</h2>
                    <p style="color: #666; margin: 0; font-size: 13px;">
                        Professional Bookkeeping
                    </p>
                </div>
                Hi ${fullName || "there"},
                <h3 style="color: #111; margin: 0 0 16px;">
                    You have been invited
                </h3>

                <p style="color: #444; line-height: 1.6;">
                    You have been invited to join <strong>${companyName}</strong>
                    on LedgerIQ as a <strong>${roleLabel}</strong>.
                </p>

                <p style="color: #444; line-height: 1.6;">
                    Click the button below to set your password
                    and activate your account:
                </p>

                
                 <a href="${inviteLink}"
                    style="
                        display: inline-block;
                        background: #10b981;
                        color: white;
                        padding: 12px 28px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 14px;
                        margin: 8px 0 24px;
                    "
                >
                    Activate Account →
                </a>

                <div style="
                    background: #f9f9f9;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 12px 16px;
                    margin-bottom: 24px;
                ">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        This link expires in <strong>7 days</strong>.
                        If you did not expect this invitation, ignore this email.
                    </p>
                </div>

                <p style="
                    color: #999;
                    font-size: 11px;
                    border-top: 1px solid #eee;
                    padding-top: 16px;
                    margin: 0;
                ">
                    LedgerIQ — Professional Bookkeeping Platform
                </p>
            </div>
        `,
    });

    if (error) throw new Error(`Failed to send email: ${error.message}`);
};

// ── Send invite ──────────────────────────────────
export const sendInvite = async (body: SendInviteBody, invitedBy: string) => {
    const { email, role, company_id } = body;

    // Get company name
    const { data: company, error: companyError } = await supabaseAdmin
        .from("companies")
        .select("id, name")
        .eq("id", company_id)
        .single();

    if (companyError) throw new Error("Company not found");

    // Check if pending invite already exists for this email + company
    const { data: existingInvite } = await supabaseAdmin
        .from("invites")
        .select("id, status")
        .eq("email", email)
        .eq("company_id", company_id)
        .eq("status", "pending")
        .single();

    if (existingInvite) {
        // Expire old invite
        await supabaseAdmin
            .from("invites")
            .update({ status: "expired" })
            .eq("status", "pending")
            .lt("expires_at", new Date().toISOString());
    }

    // Create new invite
    const { data: invite, error: inviteError } = await supabaseAdmin
        .from("invites")
        .insert({
            email,
            role,
            company_id,
            invited_by: invitedBy,
            status: "pending",
            expires_at: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
        })
        .select()
        .single();

    if (inviteError) throw new Error(inviteError.message);

    await sendInviteEmail(
        email,
        company.name,
        invite.token,
        role,
        body.full_name ?? "",
    );

    return {
        invite,
        message: "Invite sent successfully",
    };
};

// ── Validate token ───────────────────────────────
export const validateInvite = async (token: string) => {
    const { data: invite, error } = await supabaseAdmin
        .from("invites")
        .select(
            `
            *,
            companies (
                id,
                name
            )
        `,
        )
        .eq("token", token)
        .single();

    if (error || !invite) {
        throw new Error("Invalid invite link");
    }

    if (invite.status === "accepted") {
        throw new Error("This invite has already been accepted");
    }

    if (invite.status === "expired") {
        throw new Error("This invite link has expired");
    }

    if (new Date(invite.expires_at) < new Date()) {
        // Auto expire
        await supabaseAdmin
            .from("invites")
            .update({ status: "expired" })
            .eq("id", invite.id);
        throw new Error("This invite link has expired");
    }

    return {
        invite,
        company_name: (invite.companies as any).name,
        email: invite.email,
        role: invite.role,
    };
};

// ── Accept invite (create user + set password) ───
export const acceptInvite = async (body: AcceptInviteBody) => {
    const { token, password, full_name } = body;

    // Validate token first
    const { invite, company_name } = await validateInvite(token);

    // Create auth user
    const { data: authUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
            email: invite.email,
            password,
            email_confirm: true,
            app_metadata: {
                role: invite.role,
                company_id: invite.company_id,
            },
            user_metadata: {
                full_name,
            },
        });

    if (createError) throw new Error(createError.message);

    const userId = authUser.user.id;

    // Link user to company
    const { error: linkError } = await supabaseAdmin
        .from("user_companies")
        .insert({
            user_id: userId,
            company_id: invite.company_id,
            role: invite.role,
        });

    if (linkError) throw new Error(linkError.message);

    // If client_owner update company owner_id and email
    if (invite.role === "client_owner") {
        await supabaseAdmin
            .from("companies")
            .update({
                owner_id: userId,
                email: invite.email,
            })
            .eq("id", invite.company_id);
    }

    // Mark invite as accepted
    await supabaseAdmin
        .from("invites")
        .update({ status: "accepted" })
        .eq("id", invite.id);

    return {
        message: "Account activated successfully",
        company_name,
        email: invite.email,
        role: invite.role,
    };
};

// ── Get invites for a company ────────────────────
export const getCompanyInvites = async (companyId: string) => {
    const { data, error } = await supabaseAdmin
        .from("invites")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};
