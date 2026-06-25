import { useEffect, useState } from "react";
import { useAuthStore } from "../../modules/auth/auth.store";
import { useReportsStore } from "../../modules/reports/reports.store";
import {
    formatAmount,
    formatDate,
    todayISO,
    firstDayOfMonth,
} from "../../modules/reports/reports.utils";
import BalancedIndicator from "../../components/reports/BalancedIndicator";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

const TABS = [
    { value: "trial-balance", label: "Trial Balance" },
    { value: "profit-loss", label: "Profit & Loss" },
    { value: "balance-sheet", label: "Balance Sheet" },
];

export default function MyReportsPage() {
    const { companyId } = useAuthStore();
    const {
        trialBalance,
        profitLoss,
        balanceSheet,
        loadingTrialBalance,
        loadingProfitLoss,
        loadingBalanceSheet,
        fetchTrialBalance,
        fetchProfitLoss,
        fetchBalanceSheet,
    } = useReportsStore();

    const [activeTab, setActiveTab] = useState("trial-balance");
    const [asOfDate, setAsOfDate] = useState(todayISO());
    const [startDate, setStartDate] = useState(firstDayOfMonth());
    const [endDate, setEndDate] = useState(todayISO());

    useEffect(() => {
        if (!companyId) return;
        if (activeTab === "trial-balance")
            fetchTrialBalance(companyId, asOfDate);
        if (activeTab === "balance-sheet")
            fetchBalanceSheet(companyId, asOfDate);
        if (activeTab === "profit-loss")
            fetchProfitLoss(companyId, startDate, endDate);
    }, [companyId, activeTab, asOfDate, startDate, endDate, fetchTrialBalance, fetchBalanceSheet, fetchProfitLoss]);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-zinc-100">Reports</h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                    Your company's financial reports
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-zinc-800 border border-white/10">
                    {TABS.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="text-xs data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-zinc-100"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {activeTab === "trial-balance" && (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <div className="space-y-1">
                            <Label className="text-zinc-500 text-xs">
                                As of date
                            </Label>
                            <Input
                                type="date"
                                value={asOfDate}
                                onChange={(e) => setAsOfDate(e.target.value)}
                                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-44"
                            />
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        {loadingTrialBalance ? (
                            <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                                Loading...
                            </div>
                        ) : !trialBalance || trialBalance.rows.length === 0 ? (
                            <div className="flex items-center justify-center py-20 text-zinc-400 text-sm">
                                No posted transactions found
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                    <p className="text-xs text-zinc-500">
                                        As of{" "}
                                        {formatDate(trialBalance.as_of_date)}
                                    </p>
                                    <BalancedIndicator
                                        isBalanced={trialBalance.is_balanced}
                                    />
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-zinc-400">
                                                Code
                                            </TableHead>
                                            <TableHead className="text-zinc-400">
                                                Account
                                            </TableHead>
                                            <TableHead className="text-zinc-400 text-right">
                                                Debit
                                            </TableHead>
                                            <TableHead className="text-zinc-400 text-right">
                                                Credit
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trialBalance.rows.map((row) => (
                                            <TableRow
                                                key={row.account_id}
                                                className="border-white/10 hover:bg-white/5"
                                            >
                                                <TableCell className="font-mono text-xs text-zinc-500">
                                                    {row.code}
                                                </TableCell>
                                                <TableCell className="text-zinc-200 text-sm">
                                                    {row.name}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm text-zinc-300">
                                                    {row.debit > 0
                                                        ? formatAmount(
                                                              row.debit,
                                                          )
                                                        : "—"}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm text-zinc-300">
                                                    {row.credit > 0
                                                        ? formatAmount(
                                                              row.credit,
                                                          )
                                                        : "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "profit-loss" && (
                <div className="space-y-3">
                    <div className="flex justify-end gap-2">
                        <div className="space-y-1">
                            <Label className="text-zinc-500 text-xs">
                                From
                            </Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-40"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-zinc-500 text-xs">To</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-40"
                            />
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden p-4">
                        {loadingProfitLoss ? (
                            <p className="text-sm text-zinc-500 text-center py-12">
                                Loading...
                            </p>
                        ) : profitLoss ? (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">
                                        Total revenue
                                    </span>
                                    <span className="text-emerald-400 font-mono">
                                        {formatAmount(profitLoss.total_revenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">
                                        Total expenses
                                    </span>
                                    <span className="text-red-400 font-mono">
                                        {formatAmount(
                                            profitLoss.total_expenses,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-white/10 text-sm font-semibold">
                                    <span className="text-zinc-200">
                                        {profitLoss.net_profit >= 0
                                            ? "Net profit"
                                            : "Net loss"}
                                    </span>
                                    <span
                                        className={
                                            profitLoss.net_profit >= 0
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                        }
                                    >
                                        {formatAmount(profitLoss.net_profit)}
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {activeTab === "balance-sheet" && (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <div className="space-y-1">
                            <Label className="text-zinc-500 text-xs">
                                As of date
                            </Label>
                            <Input
                                type="date"
                                value={asOfDate}
                                onChange={(e) => setAsOfDate(e.target.value)}
                                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-44"
                            />
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden p-4">
                        {loadingBalanceSheet ? (
                            <p className="text-sm text-zinc-500 text-center py-12">
                                Loading...
                            </p>
                        ) : balanceSheet ? (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">
                                        Total assets
                                    </span>
                                    <span className="text-blue-400 font-mono">
                                        {formatAmount(
                                            balanceSheet.total_assets,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">
                                        Total liabilities
                                    </span>
                                    <span className="text-amber-400 font-mono">
                                        {formatAmount(
                                            balanceSheet.total_liabilities,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">
                                        Total equity
                                    </span>
                                    <span className="text-purple-400 font-mono">
                                        {formatAmount(
                                            balanceSheet.total_equity,
                                        )}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-white/10">
                                    <BalancedIndicator
                                        isBalanced={balanceSheet.is_balanced}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
