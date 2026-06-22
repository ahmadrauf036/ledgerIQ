"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLedger = exports.deleteEntry = exports.postEntry = exports.updateEntry = exports.createEntry = exports.getEntryById = exports.getEntries = void 0;
const supabase_1 = require("../../lib/supabase");
// ── Generate sequential entry number per company ──
const generateEntryNumber = async (companyId) => {
    const { count, error } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId);
    if (error)
        throw new Error(error.message);
    const nextNumber = (count ?? 0) + 1;
    return `JE-${String(nextNumber).padStart(3, "0")}`;
};
// ── Validate all accounts belong to company + are active ──
const validateLineAccounts = async (companyId, lines) => {
    const accountIds = [...new Set(lines.map((l) => l.account_id))];
    const { data: accounts, error } = await supabase_1.supabaseAdmin
        .from("accounts")
        .select("id, company_id, is_active, code, name")
        .in("id", accountIds);
    if (error)
        throw new Error(error.message);
    if (!accounts || accounts.length !== accountIds.length) {
        throw new Error("One or more accounts not found");
    }
    // Check if any of these accounts have children (are parent accounts)
    const { data: childAccounts, error: childError } = await supabase_1.supabaseAdmin
        .from("accounts")
        .select("parent_id")
        .in("parent_id", accountIds);
    if (childError)
        throw new Error(childError.message);
    const parentIdsWithChildren = new Set((childAccounts ?? []).map((c) => c.parent_id));
    for (const account of accounts) {
        if (account.company_id !== companyId) {
            throw new Error(`Account ${account.code} does not belong to this company`);
        }
        if (!account.is_active) {
            throw new Error(`Account ${account.code} — ${account.name} is inactive`);
        }
        if (parentIdsWithChildren.has(account.id)) {
            throw new Error(`Cannot post to ${account.code} — ${account.name}. It is a header account with sub-accounts. Select a specific sub-account instead.`);
        }
    }
    return accounts;
};
// ── Get all entries for a company ────────────────
const getEntries = async (companyId, status) => {
    let query = supabase_1.supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("company_id", companyId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
    if (status) {
        query = query.eq("status", status);
    }
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getEntries = getEntries;
// ── Get single entry with lines ──────────────────
const getEntryById = async (entryId) => {
    const { data: entry, error: entryError } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();
    if (entryError)
        throw new Error("Entry not found");
    const { data: lines, error: linesError } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .select(`
            *,
            accounts (
                code,
                name
            )
        `)
        .eq("entry_id", entryId)
        .order("created_at", { ascending: true });
    if (linesError)
        throw new Error(linesError.message);
    const formattedLines = (lines ?? []).map((line) => ({
        id: line.id,
        entry_id: line.entry_id,
        account_id: line.account_id,
        account_code: line.accounts?.code,
        account_name: line.accounts?.name,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
        created_at: line.created_at,
    }));
    return {
        ...entry,
        lines: formattedLines,
    };
};
exports.getEntryById = getEntryById;
// ── Create entry ──────────────────────────────────
const createEntry = async (body, createdBy) => {
    const { company_id, date, description, status, lines } = body;
    // Validate accounts
    await validateLineAccounts(company_id, lines);
    // Generate entry number
    const entryNumber = await generateEntryNumber(company_id);
    // Create journal entry header
    const { data: entry, error: entryError } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .insert({
        company_id,
        entry_number: entryNumber,
        date,
        description: description ?? null,
        status,
        created_by: createdBy,
        posted_at: status === "posted" ? new Date().toISOString() : null,
    })
        .select()
        .single();
    if (entryError)
        throw new Error(entryError.message);
    // Create entry lines
    const linesPayload = lines.map((line) => ({
        entry_id: entry.id,
        account_id: line.account_id,
        debit: line.debit,
        credit: line.credit,
        description: line.description ?? null,
    }));
    const { error: linesError } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .insert(linesPayload);
    if (linesError) {
        // Rollback — delete the entry header if lines fail
        await supabase_1.supabaseAdmin.from("journal_entries").delete().eq("id", entry.id);
        throw new Error(linesError.message);
    }
    return await (0, exports.getEntryById)(entry.id);
};
exports.createEntry = createEntry;
// ── Update entry (draft only) ────────────────────
const updateEntry = async (entryId, body) => {
    const { data: entry, error: fetchError } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();
    if (fetchError)
        throw new Error("Entry not found");
    if (entry.status !== "draft") {
        throw new Error("Only draft entries can be edited");
    }
    // Update header fields
    const { error: updateError } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .update({
        ...(body.date && { date: body.date }),
        ...(body.description !== undefined && {
            description: body.description,
        }),
        updated_at: new Date().toISOString(),
    })
        .eq("id", entryId);
    if (updateError)
        throw new Error(updateError.message);
    // If lines provided, replace all lines
    if (body.lines) {
        await validateLineAccounts(entry.company_id, body.lines);
        // Delete old lines
        const { error: deleteError } = await supabase_1.supabaseAdmin
            .from("entry_lines")
            .delete()
            .eq("entry_id", entryId);
        if (deleteError)
            throw new Error(deleteError.message);
        // Insert new lines
        const linesPayload = body.lines.map((line) => ({
            entry_id: entryId,
            account_id: line.account_id,
            debit: line.debit,
            credit: line.credit,
            description: line.description ?? null,
        }));
        const { error: insertError } = await supabase_1.supabaseAdmin
            .from("entry_lines")
            .insert(linesPayload);
        if (insertError)
            throw new Error(insertError.message);
    }
    return await (0, exports.getEntryById)(entryId);
};
exports.updateEntry = updateEntry;
// ── Post a draft entry ───────────────────────────
const postEntry = async (entryId) => {
    const { data: entry, error: fetchError } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();
    if (fetchError)
        throw new Error("Entry not found");
    if (entry.status !== "draft") {
        throw new Error("Only draft entries can be posted");
    }
    // Verify entry has at least 2 lines and is balanced
    const { data: lines, error: linesError } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .select("debit, credit")
        .eq("entry_id", entryId);
    if (linesError)
        throw new Error(linesError.message);
    if (!lines || lines.length < 2) {
        throw new Error("Entry must have at least 2 lines to be posted");
    }
    const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit), 0);
    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        throw new Error("Entry is not balanced — cannot post");
    }
    const { data, error } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .update({
        status: "posted",
        posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })
        .eq("id", entryId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.postEntry = postEntry;
// ── Delete entry (draft only) ────────────────────
const deleteEntry = async (entryId) => {
    const { data: entry, error: fetchError } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .select("status")
        .eq("id", entryId)
        .single();
    if (fetchError)
        throw new Error("Entry not found");
    if (entry.status !== "draft") {
        throw new Error("Only draft entries can be deleted");
    }
    // entry_lines will cascade delete automatically (FK ON DELETE CASCADE)
    const { error } = await supabase_1.supabaseAdmin
        .from("journal_entries")
        .delete()
        .eq("id", entryId);
    if (error)
        throw new Error(error.message);
    return { message: "Entry deleted successfully" };
};
exports.deleteEntry = deleteEntry;
// ── Get ledger for a specific account ────────────
const getLedger = async (accountId) => {
    // Get account info
    const { data: account, error: accountError } = await supabase_1.supabaseAdmin
        .from("accounts")
        .select("id, code, name, type, company_id")
        .eq("id", accountId)
        .single();
    if (accountError)
        throw new Error("Account not found");
    // Get all posted entry lines for this account, joined with entry info
    const { data: lines, error: linesError } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .select(`
            id,
            debit,
            credit,
            description,
            journal_entries!inner (
                id,
                entry_number,
                date,
                description,
                status
            )
        `)
        .eq("account_id", accountId)
        .eq("journal_entries.status", "posted")
        .order("date", { referencedTable: "journal_entries", ascending: true });
    if (linesError)
        throw new Error(linesError.message);
    // Calculate running balance
    let runningBalance = 0;
    const ledgerRows = (lines ?? []).map((line) => {
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        runningBalance += debit - credit;
        return {
            entry_id: line.journal_entries.id,
            entry_number: line.journal_entries.entry_number,
            date: line.journal_entries.date,
            description: line.description || line.journal_entries.description,
            debit,
            credit,
            running_balance: runningBalance,
        };
    });
    return {
        account,
        rows: ledgerRows,
        closing_balance: runningBalance,
    };
};
exports.getLedger = getLedger;
