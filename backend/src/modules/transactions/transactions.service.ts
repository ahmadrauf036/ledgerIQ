import { supabaseAdmin } from "../../lib/supabase";
import { logAction } from "../audit/audit.service";
import type {
    CreateEntryBody,
    UpdateEntryBody,
    EntryLineInput,
} from "./transactions.types";

// ── Generate sequential entry number per company ──
const generateEntryNumber = async (companyId: string): Promise<string> => {
    const { count, error } = await supabaseAdmin
        .from("journal_entries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId);

    if (error) throw new Error(error.message);

    const nextNumber = (count ?? 0) + 1;
    return `JE-${String(nextNumber).padStart(3, "0")}`;
};

// ── Validate all accounts belong to company + are active + not parent ──
const validateLineAccounts = async (
    companyId: string,
    lines: EntryLineInput[],
) => {
    const accountIds = [...new Set(lines.map((l) => l.account_id))];

    const { data: accounts, error } = await supabaseAdmin
        .from("accounts")
        .select("id, company_id, is_active, code, name")
        .in("id", accountIds);

    if (error) throw new Error(error.message);

    if (!accounts || accounts.length !== accountIds.length) {
        throw new Error("One or more accounts not found");
    }

    const { data: childAccounts, error: childError } = await supabaseAdmin
        .from("accounts")
        .select("parent_id")
        .in("parent_id", accountIds);

    if (childError) throw new Error(childError.message);

    const parentIdsWithChildren = new Set(
        (childAccounts ?? []).map((c) => c.parent_id),
    );

    for (const account of accounts) {
        if (account.company_id !== companyId) {
            throw new Error(
                `Account ${account.code} does not belong to this company`,
            );
        }
        if (!account.is_active) {
            throw new Error(
                `Account ${account.code} — ${account.name} is inactive`,
            );
        }
        if (parentIdsWithChildren.has(account.id)) {
            throw new Error(
                `Cannot post to ${account.code} — ${account.name}. It is a header account with sub-accounts. Select a specific sub-account instead.`,
            );
        }
    }

    return accounts;
};

// ── Get all entries for a company ────────────────
export const getEntries = async (companyId: string, status?: string) => {
    let query = supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("company_id", companyId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

// ── Get single entry with lines ──────────────────
export const getEntryById = async (entryId: string) => {
    const { data: entry, error: entryError } = await supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();

    if (entryError) throw new Error("Entry not found");

    const { data: lines, error: linesError } = await supabaseAdmin
        .from("entry_lines")
        .select(
            `
            *,
            accounts (
                code,
                name
            )
        `,
        )
        .eq("entry_id", entryId)
        .order("created_at", { ascending: true });

    if (linesError) throw new Error(linesError.message);

    const formattedLines = (lines ?? []).map((line: any) => ({
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

// ── Create entry ──────────────────────────────────
export const createEntry = async (body: CreateEntryBody, createdBy: string) => {
    const { company_id, date, description, status, lines } = body;

    await validateLineAccounts(company_id, lines);

    const entryNumber = await generateEntryNumber(company_id);

    const { data: entry, error: entryError } = await supabaseAdmin
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

    if (entryError) throw new Error(entryError.message);

    const linesPayload = lines.map((line) => ({
        entry_id: entry.id,
        account_id: line.account_id,
        debit: line.debit,
        credit: line.credit,
        description: line.description ?? null,
    }));

    const { error: linesError } = await supabaseAdmin
        .from("entry_lines")
        .insert(linesPayload);

    if (linesError) {
        await supabaseAdmin.from("journal_entries").delete().eq("id", entry.id);
        throw new Error(linesError.message);
    }

    const result = await getEntryById(entry.id);

    // ── Audit log ──
    logAction({
        company_id,
        user_id: createdBy,
        action: "CREATE",
        table_name: "journal_entries",
        record_id: entry.id,
        new_data: {
            entry_number: entryNumber,
            date,
            description,
            status,
            lines,
        },
    });

    return result;
};

// ── Update entry (draft only) ────────────────────
export const updateEntry = async (
    entryId: string,
    body: UpdateEntryBody,
    updatedBy: string,
) => {
    const { data: entry, error: fetchError } = await supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();

    if (fetchError) throw new Error("Entry not found");

    if (entry.status !== "draft") {
        throw new Error("Only draft entries can be edited");
    }

    const { error: updateError } = await supabaseAdmin
        .from("journal_entries")
        .update({
            ...(body.date && { date: body.date }),
            ...(body.description !== undefined && {
                description: body.description,
            }),
            updated_at: new Date().toISOString(),
        })
        .eq("id", entryId);

    if (updateError) throw new Error(updateError.message);

    if (body.lines) {
        await validateLineAccounts(entry.company_id, body.lines);

        const { error: deleteError } = await supabaseAdmin
            .from("entry_lines")
            .delete()
            .eq("entry_id", entryId);

        if (deleteError) throw new Error(deleteError.message);

        const linesPayload = body.lines.map((line) => ({
            entry_id: entryId,
            account_id: line.account_id,
            debit: line.debit,
            credit: line.credit,
            description: line.description ?? null,
        }));

        const { error: insertError } = await supabaseAdmin
            .from("entry_lines")
            .insert(linesPayload);

        if (insertError) throw new Error(insertError.message);
    }

    const result = await getEntryById(entryId);

    // ── Audit log ──
    logAction({
        company_id: entry.company_id,
        user_id: updatedBy,
        action: "UPDATE",
        table_name: "journal_entries",
        record_id: entryId,
        old_data: entry,
        new_data: body as unknown as Record<string, unknown>,
    });

    return result;
};

// ── Post a draft entry ───────────────────────────
export const postEntry = async (entryId: string, postedBy: string) => {
    const { data: entry, error: fetchError } = await supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();

    if (fetchError) throw new Error("Entry not found");

    if (entry.status !== "draft") {
        throw new Error("Only draft entries can be posted");
    }

    const { data: lines, error: linesError } = await supabaseAdmin
        .from("entry_lines")
        .select("debit, credit")
        .eq("entry_id", entryId);

    if (linesError) throw new Error(linesError.message);

    if (!lines || lines.length < 2) {
        throw new Error("Entry must have at least 2 lines to be posted");
    }

    const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit), 0);

    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        throw new Error("Entry is not balanced — cannot post");
    }

    const { data, error } = await supabaseAdmin
        .from("journal_entries")
        .update({
            status: "posted",
            posted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .select()
        .single();

    if (error) throw new Error(error.message);

    // ── Audit log ──
    logAction({
        company_id: entry.company_id,
        user_id: postedBy,
        action: "POST",
        table_name: "journal_entries",
        record_id: entryId,
        old_data: { status: "draft" },
        new_data: { status: "posted", posted_at: data.posted_at },
    });

    return data;
};

// ── Delete entry (draft only) ────────────────────
export const deleteEntry = async (entryId: string, deletedBy: string) => {
    const { data: entry, error: fetchError } = await supabaseAdmin
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();

    if (fetchError) throw new Error("Entry not found");

    if (entry.status !== "draft") {
        throw new Error("Only draft entries can be deleted");
    }

    // Get lines before deletion for the audit trail
    const { data: lines } = await supabaseAdmin
        .from("entry_lines")
        .select("*")
        .eq("entry_id", entryId);

    const { error } = await supabaseAdmin
        .from("journal_entries")
        .delete()
        .eq("id", entryId);

    if (error) throw new Error(error.message);

    // ── Audit log ──
    logAction({
        company_id: entry.company_id,
        user_id: deletedBy,
        action: "DELETE",
        table_name: "journal_entries",
        record_id: entryId,
        old_data: { entry, lines },
    });

    return { message: "Entry deleted successfully" };
};

// ── Get ledger for a specific account ────────────
export const getLedger = async (accountId: string) => {
    const { data: account, error: accountError } = await supabaseAdmin
        .from("accounts")
        .select("id, code, name, type, company_id")
        .eq("id", accountId)
        .single();

    if (accountError) throw new Error("Account not found");

    const { data: lines, error: linesError } = await supabaseAdmin
        .from("entry_lines")
        .select(
            `
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
        `,
        )
        .eq("account_id", accountId)
        .eq("journal_entries.status", "posted")
        .order("date", { referencedTable: "journal_entries", ascending: true });

    if (linesError) throw new Error(linesError.message);

    let runningBalance = 0;
    const ledgerRows = (lines ?? []).map((line: any) => {
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
