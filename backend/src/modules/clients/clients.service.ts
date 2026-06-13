import { supabase, supabaseAdmin } from "../../lib/supabase";
import type { CreateClientBody } from "./clients.types";

// ── Get all clients ──────────────────────────────
export const getAllClients = async () => {
    const { data, error } = await supabaseAdmin
        .from("user_companies")
        .select(
            `
            user_id,
            role,
            companies (
                id,
                name,
                currency,
                financial_year_start,
                address,
                phone,
                ntn_number,
                is_active,
                created_at
            )
        `,
        )
        .eq("role", "client_owner");

    if (error) throw new Error(error.message);

    // Get user details from auth for each client
    const enriched = await Promise.all(
        data.map(async (item: any) => {
            const { data: userData } =
                await supabaseAdmin.auth.admin.getUserById(item.user_id);

            return {
                id: item.companies.id,
                company_name: item.companies.name,
                full_name: userData?.user?.user_metadata?.full_name ?? "",
                email: userData?.user?.email ?? "",
                currency: item.companies.currency,
                financial_year_start: item.companies.financial_year_start,
                address: item.companies.address,
                phone: item.companies.phone,
                ntn_number: item.companies.ntn_number,
                is_active: item.companies.is_active,
                created_at: item.companies.created_at,
                user_id: item.user_id,
            };
        }),
    );

    return enriched;
};

// ── Get single client ────────────────────────────
export const getClientById = async (companyId: string) => {
    const { data, error } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Create client ────────────────────────────────
export const createClient = async (body: CreateClientBody) => {
    const {
        company_name,
        full_name,
        email,
        phone,
        address,
        ntn_number,
        financial_year_start,
        currency,
    } = body;

    // Step 1 — Create company
    const { data: company, error: companyError } = await supabaseAdmin
        .from("companies")
        .insert({
            name: company_name,
            currency,
            financial_year_start,
            phone: phone ?? null,
            address: address ?? null,
            ntn_number: ntn_number ?? null,
        })
        .select()
        .single();

    if (companyError) throw new Error(companyError.message);

    // Step 2 — Create Supabase auth user with invite
    const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: false, // sends invite email
            app_metadata: {
                role: "client_owner",
                company_id: company.id,
            },
            user_metadata: {
                full_name,
            },
        });

    if (authError) {
        // Rollback — delete company if user creation fails
        await supabaseAdmin.from("companies").delete().eq("id", company.id);
        throw new Error(authError.message);
    }

    // Step 3 — Link user to company in user_companies
    const { error: linkError } = await supabaseAdmin.from("user_companies").insert({
        user_id: authUser.user.id,
        company_id: company.id,
        role: "client_owner",
    });

    if (linkError) throw new Error(linkError.message);

    // Step 4 — Update company owner_id
    await supabaseAdmin
        .from("companies")
        .update({ owner_id: authUser.user.id })
        .eq("id", company.id);

    return {
        company,
        user: {
            id: authUser.user.id,
            email: authUser.user.email,
            full_name,
        },
    };
};

// ── Update client ────────────────────────────────
export const updateClient = async (
    companyId: string,
    updates: Partial<{
        company_name: string;
        phone: string;
        address: string;
        ntn_number: string;
        financial_year_start: number;
        currency: string;
        is_active: boolean;
    }>,
) => {
    const { data, error } = await supabaseAdmin
        .from("companies")
        .update({
            ...(updates.company_name && { name: updates.company_name }),
            ...(updates.phone !== undefined && { phone: updates.phone }),
            ...(updates.address !== undefined && { address: updates.address }),
            ...(updates.ntn_number !== undefined && {
                ntn_number: updates.ntn_number,
            }),
            ...(updates.financial_year_start && {
                financial_year_start: updates.financial_year_start,
            }),
            ...(updates.currency && { currency: updates.currency }),
            ...(updates.is_active !== undefined && {
                is_active: updates.is_active,
            }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Deactivate client ────────────────────────────
export const deactivateClient = async (companyId: string) => {
    const { data, error } = await supabaseAdmin
        .from("companies")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", companyId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};
