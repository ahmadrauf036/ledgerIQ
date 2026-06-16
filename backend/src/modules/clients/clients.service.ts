import { supabaseAdmin } from "../../lib/supabase";
import { seedDefaultAccounts } from "../accounts/accounts.seed";
import { sendInvite } from "../invites/invites.service";
import type { CreateClientBody } from "./clients.types";

// ── Get all clients ──────────────────────────────
export const getAllClients = async () => {
    // Fetch accepted clients (have user_companies row)
    const { data: acceptedData, error: acceptedError } = await supabaseAdmin
        .from("user_companies")
        .select(
            `
            user_id,
            role,
            companies (
                id, name, email, currency,
                financial_year_start, address,
                phone, ntn_number, is_active, created_at
            )
        `,
        )
        .eq("role", "client_owner");

    if (acceptedError) throw new Error(acceptedError.message);

    const accepted = await Promise.all(
        (acceptedData ?? []).map(async (item: any) => {
            const { data: userData } =
                await supabaseAdmin.auth.admin.getUserById(item.user_id);
            return {
                id: item.companies.id,
                company_name: item.companies.name,
                full_name: userData?.user?.user_metadata?.full_name ?? "",
                email: item.companies.email ?? userData?.user?.email ?? "",
                currency: item.companies.currency,
                financial_year_start: item.companies.financial_year_start,
                address: item.companies.address,
                phone: item.companies.phone,
                ntn_number: item.companies.ntn_number,
                is_active: item.companies.is_active,
                created_at: item.companies.created_at,
                user_id: item.user_id,
                invite_status: "accepted",
            };
        }),
    );

    // Fetch pending clients (have invite but no user yet)
    const { data: pendingData, error: pendingError } = await supabaseAdmin
        .from("invites")
        .select(
            `
            email,
            status,
            role,
            companies (
                id, name, email, currency,
                financial_year_start, address,
                phone, ntn_number, is_active, created_at
            )
        `,
        )
        .eq("role", "client_owner")
        .eq("status", "pending");

    if (pendingError) throw new Error(pendingError.message);
    const acceptedCompanyIds = accepted.map((c) => c.id);
    const pending = (pendingData ?? [])
        .filter((item: any) => !acceptedCompanyIds.includes(item.companies.id))
        .map((item: any) => ({
            id: item.companies.id,
            company_name: item.companies.name,
            full_name: "",
            email: item.companies.email ?? item.email,
            currency: item.companies.currency,
            financial_year_start: item.companies.financial_year_start,
            address: item.companies.address,
            phone: item.companies.phone,
            ntn_number: item.companies.ntn_number,
            is_active: item.companies.is_active,
            created_at: item.companies.created_at,
            user_id: null,
            invite_status: "pending", // ← useful for showing badge in UI
        }));

    // Merge — accepted first then pending
    return [...accepted, ...pending];
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
export const createClient = async (body: CreateClientBody, invitedBy: string) => {
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

    // Step 1 — Create company only
    // No auth user created yet — user is created when they set password
    const { data: company, error: companyError } = await supabaseAdmin
        .from("companies")
        .insert({
            name: company_name,
            email, // store email in company
            currency,
            financial_year_start,
            phone: phone ?? null,
            address: address ?? null,
            ntn_number: ntn_number ?? null,
        })
        .select()
        .single();

    if (companyError) throw new Error(companyError.message);
    // Step 2 — Seed default chart of accounts
    try {
        await seedDefaultAccounts(company.id);
    } catch (err) {
        // Log but don't fail — accounts can be seeded manually later
        console.error("Failed to seed accounts:", (err as Error).message);
    }
    // Step 3 — Create invite row + send email via Resend
    try {
        const { invite } = await sendInvite(
            {
                email,
                role: "client_owner",
                company_id: company.id,
                full_name, // ← pass it
            },
            invitedBy,
        );

        return {
            company,
            invite,
            message: "Client created and invite email sent",
        };
    } catch (err) {
        // Rollback — delete company if invite fails
        await supabaseAdmin.from("companies").delete().eq("id", company.id);
        throw new Error((err as Error).message);
    }
};;

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
        .update({
            is_active: false,
            updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};
