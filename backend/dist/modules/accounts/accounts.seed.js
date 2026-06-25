"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultAccounts = void 0;
const supabase_1 = require("../../lib/supabase");
const DEFAULT_ACCOUNTS = [
    // ── ASSETS ──────────────────────────────────
    {
        code: "1000",
        name: "Assets",
        type: "asset",
        parent_code: null,
        description: "All company assets",
    },
    {
        code: "1100",
        name: "Current Assets",
        type: "asset",
        parent_code: "1000",
    },
    {
        code: "1110",
        name: "Cash in Hand",
        type: "asset",
        parent_code: "1100",
    },
    {
        code: "1120",
        name: "Bank Account",
        type: "asset",
        parent_code: "1100",
    },
    {
        code: "1130",
        name: "Accounts Receivable",
        type: "asset",
        parent_code: "1100",
        description: "Money owed by customers",
    },
    {
        code: "1140",
        name: "Inventory",
        type: "asset",
        parent_code: "1100",
    },
    {
        code: "1150",
        name: "Prepaid Expenses",
        type: "asset",
        parent_code: "1100",
    },
    {
        code: "1200",
        name: "Fixed Assets",
        type: "asset",
        parent_code: "1000",
    },
    {
        code: "1210",
        name: "Equipment",
        type: "asset",
        parent_code: "1200",
    },
    {
        code: "1220",
        name: "Furniture",
        type: "asset",
        parent_code: "1200",
    },
    {
        code: "1230",
        name: "Vehicles",
        type: "asset",
        parent_code: "1200",
    },
    {
        code: "1240",
        name: "Accumulated Depreciation",
        type: "asset",
        parent_code: "1200",
        description: "Contra asset account",
    },
    // ── LIABILITIES ──────────────────────────────
    {
        code: "2000",
        name: "Liabilities",
        type: "liability",
        parent_code: null,
        description: "All company liabilities",
    },
    {
        code: "2100",
        name: "Current Liabilities",
        type: "liability",
        parent_code: "2000",
    },
    {
        code: "2110",
        name: "Accounts Payable",
        type: "liability",
        parent_code: "2100",
        description: "Money owed to suppliers",
    },
    {
        code: "2120",
        name: "Short Term Loan",
        type: "liability",
        parent_code: "2100",
    },
    {
        code: "2130",
        name: "Salaries Payable",
        type: "liability",
        parent_code: "2100",
    },
    {
        code: "2140",
        name: "Tax Payable",
        type: "liability",
        parent_code: "2100",
    },
    {
        code: "2200",
        name: "Long Term Liabilities",
        type: "liability",
        parent_code: "2000",
    },
    {
        code: "2210",
        name: "Bank Loan",
        type: "liability",
        parent_code: "2200",
    },
    // ── EQUITY ───────────────────────────────────
    {
        code: "3000",
        name: "Equity",
        type: "equity",
        parent_code: null,
        description: "Owner equity",
    },
    {
        code: "3100",
        name: "Owner Capital",
        type: "equity",
        parent_code: "3000",
    },
    {
        code: "3200",
        name: "Retained Earnings",
        type: "equity",
        parent_code: "3000",
    },
    {
        code: "3300",
        name: "Drawings",
        type: "equity",
        parent_code: "3000",
        description: "Owner withdrawals",
    },
    // ── REVENUE ──────────────────────────────────
    {
        code: "4000",
        name: "Revenue",
        type: "revenue",
        parent_code: null,
        description: "All income",
    },
    {
        code: "4100",
        name: "Sales Revenue",
        type: "revenue",
        parent_code: "4000",
    },
    {
        code: "4200",
        name: "Service Revenue",
        type: "revenue",
        parent_code: "4000",
    },
    {
        code: "4300",
        name: "Other Income",
        type: "revenue",
        parent_code: "4000",
    },
    // ── EXPENSES ─────────────────────────────────
    {
        code: "5000",
        name: "Expenses",
        type: "expense",
        parent_code: null,
        description: "All expenses",
    },
    {
        code: "5100",
        name: "Salaries Expense",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5200",
        name: "Rent Expense",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5300",
        name: "Utilities Expense",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5400",
        name: "Office Supplies",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5500",
        name: "Depreciation Expense",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5600",
        name: "Marketing Expense",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5700",
        name: "Travel Expense",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5800",
        name: "Bank Charges",
        type: "expense",
        parent_code: "5000",
    },
    {
        code: "5900",
        name: "Miscellaneous Expense",
        type: "expense",
        parent_code: "5000",
    },
];
const seedDefaultAccounts = async (companyId) => {
    // Map to track code → inserted UUID
    const codeToId = new Map();
    // Insert in order so parents exist before children
    // First pass — insert all accounts without parent_id
    const rootAccounts = DEFAULT_ACCOUNTS.filter((a) => a.parent_code === null);
    for (const account of rootAccounts) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from("accounts")
            .insert({
            company_id: companyId,
            code: account.code,
            name: account.name,
            type: account.type,
            parent_id: null,
            description: account.description ?? null,
        })
            .select("id")
            .single();
        if (error)
            throw new Error(`Failed to seed account ${account.code}: ${error.message}`);
        codeToId.set(account.code, data.id);
    }
    // Second pass — insert all child accounts level by level
    const childAccounts = DEFAULT_ACCOUNTS.filter((a) => a.parent_code !== null);
    // Sort by code so parents are always inserted before children
    childAccounts.sort((a, b) => a.code.localeCompare(b.code));
    for (const account of childAccounts) {
        const parentId = codeToId.get(account.parent_code);
        const { data, error } = await supabase_1.supabaseAdmin
            .from("accounts")
            .insert({
            company_id: companyId,
            code: account.code,
            name: account.name,
            type: account.type,
            parent_id: parentId ?? null,
            description: account.description ?? null,
        })
            .select("id")
            .single();
        if (error)
            throw new Error(`Failed to seed account ${account.code}: ${error.message}`);
        codeToId.set(account.code, data.id);
    }
    // console.log(
    //     `✅ Seeded ${DEFAULT_ACCOUNTS.length} default accounts for company ${companyId}`,
    // );
    return { count: DEFAULT_ACCOUNTS.length };
};
exports.seedDefaultAccounts = seedDefaultAccounts;
