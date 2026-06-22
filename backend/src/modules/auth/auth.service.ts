import { supabaseAdmin } from "../../lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string) => {
    // Check user exists first
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();

    const user = users?.users?.find((u) => u.email === email);

    if (!user) {
        // Don't reveal if user exists or not — just return success
        return { message: "Password reset email sent" };
    }

    // Generate recovery link
    const { data, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
            },
        });

    if (linkError) throw new Error(linkError.message);
    // Send via Resend directly
    const { error: emailError } = await resend.emails.send({
        from: `LedgerIQ <${process.env.RESEND_FROM_EMAIL}>`,
        to: process.env.TEST_EMAIL ?? email,
        subject: "Reset your LedgerIQ password",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <div style="margin-bottom: 24px;">
                    <h2 style="color: #10b981; margin: 0 0 4px;">LedgerIQ</h2>
                    <p style="color: #666; margin: 0; font-size: 13px;">
                        Professional Bookkeeping
                    </p>
                </div>
                <h3 style="color: #111; margin: 0 0 16px;">
                    Reset your password
                </h3>
                <p style="color: #444; line-height: 1.6;">
                    We received a request to reset your LedgerIQ password.
                    Click the button below to set a new password:
                </p>
                <a
                    href="${data.properties.action_link}"
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
                    Reset Password →
                </a>
                <div style="
                    background: #f9f9f9;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 12px 16px;
                    margin-bottom: 24px;
                ">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        This link expires in <strong>1 hour</strong>.
                        If you did not request a password reset, ignore this email.
                    </p>
                </div>
                <p style="color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 16px; margin: 0;">
                    LedgerIQ — Professional Bookkeeping Platform
                </p>
            </div>
        `,
    });

    if (emailError)
        throw new Error(`Failed to send email: ${emailError.message}`);

    return { message: "Password reset email sent" };
};

// ── Delete user ──────────────────────────────────
export const deleteUser = async (userId: string) => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { message: "User deleted successfully" };
};
