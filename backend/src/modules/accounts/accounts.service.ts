import { supabaseAdmin } from "../../lib/supabase";
import { seedDefaultAccounts } from "./accounts.seed";
import type {
    CreateAccountBody,
    UpdateAccountBody,
    AccountWithBalance,
} from "./accounts.types";

// ── Build account tree ───────────────────────────
const buildTree = (
    accounts: AccountWithBalance[],
    parentId: string | null = null,
): AccountWithBalance[] => {
    return accounts
        .filter((a) => a.parent_id === parentId)
        .map((a) => ({
            ...a,
            children: buildTree(accounts, a.id),
        }));
};

// ── Get all accounts for a company ──────────────
export const getAccounts = async (companyId: string, type?: string) => {
    let query = supabaseAdmin
        .from("account_balances")
        .select("*")
        .eq("company_id", companyId)
        .order("code", { ascending: true });

    if (type) {
        query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data as AccountWithBalance[];
};

// ── Get accounts as tree ─────────────────────────
export const getAccountsTree = async (companyId: string, type?: string) => {
    const accounts = await getAccounts(companyId, type);
    return buildTree(accounts);
};

// ── Get single account ───────────────────────────
export const getAccountById = async (accountId: string) => {
    const { data, error } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("id", accountId)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Create account ───────────────────────────────
export const createAccount = async (body: CreateAccountBody) => {
    const { company_id, code, name, type, parent_id, description } = body;

    // Check code is unique within company
    const { data: existing } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("company_id", company_id)
        .eq("code", code)
        .single();

    if (existing) {
        throw new Error(`Account code ${code} already exists for this company`);
    }

    // If parent_id provided validate it belongs to same company
    if (parent_id) {
        const { data: parent } = await supabaseAdmin
            .from("accounts")
            .select("id, company_id")
            .eq("id", parent_id)
            .single();

        if (!parent || parent.company_id !== company_id) {
            throw new Error("Invalid parent account");
        }
    }

    const { data, error } = await supabaseAdmin
        .from("accounts")
        .insert({
            company_id,
            code,
            name,
            type,
            parent_id: parent_id ?? null,
            description: description ?? null,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Update account ───────────────────────────────
export const updateAccount = async (
    accountId: string,
    body: UpdateAccountBody,
) => {
    // If updating code check uniqueness
    if (body.code) {
        const { data: account } = await supabaseAdmin
            .from("accounts")
            .select("company_id")
            .eq("id", accountId)
            .single();

        if (account) {
            const { data: existing } = await supabaseAdmin
                .from("accounts")
                .select("id")
                .eq("company_id", account.company_id)
                .eq("code", body.code)
                .neq("id", accountId)
                .single();

            if (existing) {
                throw new Error(`Account code ${body.code} already exists`);
            }
        }
    }

    const { data, error } = await supabaseAdmin
        .from("accounts")
        .update({
            ...(body.code !== undefined && { code: body.code }),
            ...(body.name !== undefined && { name: body.name }),
            ...(body.type !== undefined && { type: body.type }),
            ...(body.parent_id !== undefined && { parent_id: body.parent_id }),
            ...(body.description !== undefined && {
                description: body.description,
            }),
            ...(body.is_active !== undefined && { is_active: body.is_active }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", accountId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Deactivate account ───────────────────────────
export const deactivateAccount = async (accountId: string) => {
    // Check if account has children
    const { data: children } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("parent_id", accountId)
        .eq("is_active", true);

    if (children && children.length > 0) {
        throw new Error(
            "Cannot deactivate account with active child accounts. Deactivate children first.",
        );
    }

    // Check if account has posted transactions
    const { data: lines } = await supabaseAdmin
        .from("entry_lines")
        .select("id")
        .eq("account_id", accountId)
        .limit(1);

    if (lines && lines.length > 0) {
        throw new Error("Cannot deactivate account with existing transactions");
    }

    const { data, error } = await supabaseAdmin
        .from("accounts")
        .update({
            is_active: false,
            updated_at: new Date().toISOString(),
        })
        .eq("id", accountId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Seed default accounts ────────────────────────
export const seedAccounts = async (companyId: string) => {
    // Check if accounts already exist
    const { data: existing } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("company_id", companyId)
        .limit(1);

    if (existing && existing.length > 0) {
        throw new Error("Accounts already exist for this company");
    }

    return await seedDefaultAccounts(companyId);
};
