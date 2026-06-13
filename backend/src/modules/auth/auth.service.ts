import { supabase, supabaseAdmin } from "@/lib/supabase";

export const inviteUser = async (
    email: string,
    role: string,
    companyId: string,
) => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
        app_metadata: { role, company_id: companyId },
    });
    if (error) throw new Error(error.message);
    return data.user;
};

export const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    if (error) throw new Error(error.message);
    return { message: "Password reset email sent" };
};

export const deleteUser = async (userId: string) => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return { message: "User deleted successfully" };
};
