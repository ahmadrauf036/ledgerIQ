"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAccounts = exports.deactivateAccount = exports.updateAccount = exports.createAccount = exports.getAccountById = exports.getAccountsTree = exports.getAccounts = void 0;
const supabase_1 = require("../../lib/supabase");
const accounts_seed_1 = require("./accounts.seed");
// ── Build account tree ───────────────────────────
const buildTree = (accounts, parentId = null, depth = 0) => {
    if (depth > 10)
        return [];
    return accounts
        .filter((a) => (a.parent_id ?? null) === parentId)
        .map((a) => {
        const id = a.account_id ?? a.id;
        return {
            id, // ← single clean id field
            company_id: a.company_id,
            code: a.code,
            name: a.name,
            type: a.type,
            parent_id: a.parent_id,
            is_active: a.is_active,
            total_debit: a.total_debit,
            total_credit: a.total_credit,
            balance: a.balance,
            children: buildTree(accounts, id, depth + 1),
        };
    });
};
// ── Get all accounts for a company ──────────────
const getAccounts = async (companyId, type) => {
    let query = supabase_1.supabaseAdmin
        .from("account_balances")
        .select("*")
        .eq("company_id", companyId)
        .order("code", { ascending: true });
    if (type) {
        query = query.eq("type", type);
    }
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getAccounts = getAccounts;
// ── Get accounts as tree ─────────────────────────
const getAccountsTree = async (companyId, type) => {
    const accounts = await (0, exports.getAccounts)(companyId, type);
    return buildTree(accounts);
};
exports.getAccountsTree = getAccountsTree;
// ── Get single account ───────────────────────────
const getAccountById = async (accountId) => {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("id", accountId)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getAccountById = getAccountById;
// ── Create account ───────────────────────────────
const createAccount = async (body) => {
    const { company_id, code, name, type, parent_id, description } = body;
    // Check code is unique within company
    const { data: existing } = await supabase_1.supabaseAdmin
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
        const { data: parent } = await supabase_1.supabaseAdmin
            .from("accounts")
            .select("id, company_id")
            .eq("id", parent_id)
            .single();
        if (!parent || parent.company_id !== company_id) {
            throw new Error("Invalid parent account");
        }
    }
    const { data, error } = await supabase_1.supabaseAdmin
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
    if (error)
        throw new Error(error.message);
    return data;
};
exports.createAccount = createAccount;
// ── Update account ───────────────────────────────
const updateAccount = async (accountId, body) => {
    // If updating code check uniqueness
    if (body.code) {
        const { data: account } = await supabase_1.supabaseAdmin
            .from("accounts")
            .select("company_id")
            .eq("id", accountId)
            .single();
        if (account) {
            const { data: existing } = await supabase_1.supabaseAdmin
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
    const { data, error } = await supabase_1.supabaseAdmin
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
    if (error)
        throw new Error(error.message);
    return data;
};
exports.updateAccount = updateAccount;
// ── Deactivate account ───────────────────────────
const deactivateAccount = async (accountId) => {
    // Check if account has children
    const { data: children } = await supabase_1.supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("parent_id", accountId)
        .eq("is_active", true);
    if (children && children.length > 0) {
        throw new Error("Cannot deactivate account with active child accounts. Deactivate children first.");
    }
    // Check if account has posted transactions
    const { data: lines } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .select("id")
        .eq("account_id", accountId)
        .limit(1);
    if (lines && lines.length > 0) {
        throw new Error("Cannot deactivate account with existing transactions");
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("accounts")
        .update({
        is_active: false,
        updated_at: new Date().toISOString(),
    })
        .eq("id", accountId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.deactivateAccount = deactivateAccount;
// ── Seed default accounts ────────────────────────
const seedAccounts = async (companyId) => {
    // Check if accounts already exist
    const { data: existing } = await supabase_1.supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("company_id", companyId)
        .limit(1);
    if (existing && existing.length > 0) {
        throw new Error("Accounts already exist for this company");
    }
    return await (0, accounts_seed_1.seedDefaultAccounts)(companyId);
};
exports.seedAccounts = seedAccounts;
