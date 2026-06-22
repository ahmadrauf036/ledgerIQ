"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceSheet = exports.getProfitLoss = exports.getTrialBalance = void 0;
const supabase_1 = require("../../lib/supabase");
// ── Helper: get posted entry lines up to a date ──
const getPostedLinesUpTo = async (companyId, asOfDate) => {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .select(`
            debit,
            credit,
            account_id,
            accounts!inner (
                id,
                code,
                name,
                type,
                company_id
            ),
            journal_entries!inner (
                id,
                date,
                status,
                company_id
            )
        `)
        .eq("journal_entries.company_id", companyId)
        .eq("journal_entries.status", "posted")
        .lte("journal_entries.date", asOfDate);
    if (error)
        throw new Error(error.message);
    return data ?? [];
};
// ── Helper: get posted entry lines within a date range ──
const getPostedLinesBetween = async (companyId, startDate, endDate) => {
    const { data, error } = await supabase_1.supabaseAdmin
        .from("entry_lines")
        .select(`
            debit,
            credit,
            account_id,
            accounts!inner (
                id,
                code,
                name,
                type,
                company_id
            ),
            journal_entries!inner (
                id,
                date,
                status,
                company_id
            )
        `)
        .eq("journal_entries.company_id", companyId)
        .eq("journal_entries.status", "posted")
        .gte("journal_entries.date", startDate)
        .lte("journal_entries.date", endDate);
    if (error)
        throw new Error(error.message);
    return data ?? [];
};
// ── Trial Balance ─────────────────────────────────
const getTrialBalance = async (companyId, asOfDate) => {
    const lines = await getPostedLinesUpTo(companyId, asOfDate);
    // Aggregate by account
    const accountMap = new Map();
    for (const line of lines) {
        const acc = line.accounts;
        const key = acc.id;
        if (!accountMap.has(key)) {
            accountMap.set(key, {
                account_id: acc.id,
                code: acc.code,
                name: acc.name,
                type: acc.type,
                total_debit: 0,
                total_credit: 0,
            });
        }
        const entry = accountMap.get(key);
        entry.total_debit += Number(line.debit);
        entry.total_credit += Number(line.credit);
    }
    // Convert to trial balance rows (net debit OR net credit per account)
    const rows = Array.from(accountMap.values())
        .map((acc) => {
        const net = acc.total_debit - acc.total_credit;
        return {
            account_id: acc.account_id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            debit: net > 0 ? net : 0,
            credit: net < 0 ? Math.abs(net) : 0,
        };
    })
        .filter((row) => row.debit !== 0 || row.credit !== 0)
        .sort((a, b) => a.code.localeCompare(b.code));
    const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);
    return {
        company_id: companyId,
        as_of_date: asOfDate,
        rows,
        total_debit: totalDebit,
        total_credit: totalCredit,
        is_balanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
};
exports.getTrialBalance = getTrialBalance;
// ── Profit & Loss ──────────────────────────────────
const getProfitLoss = async (companyId, startDate, endDate) => {
    const lines = await getPostedLinesBetween(companyId, startDate, endDate);
    const revenueMap = new Map();
    const expenseMap = new Map();
    for (const line of lines) {
        const acc = line.accounts;
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        if (acc.type === "revenue") {
            if (!revenueMap.has(acc.id)) {
                revenueMap.set(acc.id, {
                    account_id: acc.id,
                    code: acc.code,
                    name: acc.name,
                    amount: 0,
                });
            }
            // Revenue increases with credit
            revenueMap.get(acc.id).amount += credit - debit;
        }
        if (acc.type === "expense") {
            if (!expenseMap.has(acc.id)) {
                expenseMap.set(acc.id, {
                    account_id: acc.id,
                    code: acc.code,
                    name: acc.name,
                    amount: 0,
                });
            }
            // Expense increases with debit
            expenseMap.get(acc.id).amount += debit - credit;
        }
    }
    const revenue = Array.from(revenueMap.values())
        .filter((r) => r.amount !== 0)
        .sort((a, b) => a.code.localeCompare(b.code));
    const expenses = Array.from(expenseMap.values())
        .filter((e) => e.amount !== 0)
        .sort((a, b) => a.code.localeCompare(b.code));
    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
        company_id: companyId,
        start_date: startDate,
        end_date: endDate,
        revenue,
        expenses,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_profit: totalRevenue - totalExpenses,
    };
};
exports.getProfitLoss = getProfitLoss;
// ── Balance Sheet ──────────────────────────────────
const getBalanceSheet = async (companyId, asOfDate) => {
    const lines = await getPostedLinesUpTo(companyId, asOfDate);
    const assetMap = new Map();
    const liabilityMap = new Map();
    const equityMap = new Map();
    // Also need net profit to roll into equity (Retained Earnings)
    let netProfitForPeriod = 0;
    for (const line of lines) {
        const acc = line.accounts;
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        if (acc.type === "asset") {
            if (!assetMap.has(acc.id)) {
                assetMap.set(acc.id, {
                    account_id: acc.id,
                    code: acc.code,
                    name: acc.name,
                    amount: 0,
                });
            }
            // Assets increase with debit
            assetMap.get(acc.id).amount += debit - credit;
        }
        if (acc.type === "liability") {
            if (!liabilityMap.has(acc.id)) {
                liabilityMap.set(acc.id, {
                    account_id: acc.id,
                    code: acc.code,
                    name: acc.name,
                    amount: 0,
                });
            }
            // Liabilities increase with credit
            liabilityMap.get(acc.id).amount += credit - debit;
        }
        if (acc.type === "equity") {
            if (!equityMap.has(acc.id)) {
                equityMap.set(acc.id, {
                    account_id: acc.id,
                    code: acc.code,
                    name: acc.name,
                    amount: 0,
                });
            }
            // Equity increases with credit
            equityMap.get(acc.id).amount += credit - debit;
        }
        if (acc.type === "revenue") {
            netProfitForPeriod += credit - debit;
        }
        if (acc.type === "expense") {
            netProfitForPeriod -= debit - credit;
        }
    }
    const assets = Array.from(assetMap.values())
        .filter((a) => a.amount !== 0)
        .sort((a, b) => a.code.localeCompare(b.code));
    const liabilities = Array.from(liabilityMap.values())
        .filter((l) => l.amount !== 0)
        .sort((a, b) => a.code.localeCompare(b.code));
    const equity = Array.from(equityMap.values())
        .filter((e) => e.amount !== 0)
        .sort((a, b) => a.code.localeCompare(b.code));
    // Add net profit as a virtual "Retained Earnings (current period)" line
    // This ensures Assets = Liabilities + Equity holds true
    if (Math.abs(netProfitForPeriod) > 0.01) {
        equity.push({
            account_id: "calculated-retained-earnings",
            code: "—",
            name: "Retained Earnings (current period)",
            amount: netProfitForPeriod,
        });
    }
    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);
    return {
        company_id: companyId,
        as_of_date: asOfDate,
        assets,
        liabilities,
        equity,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
};
exports.getBalanceSheet = getBalanceSheet;
