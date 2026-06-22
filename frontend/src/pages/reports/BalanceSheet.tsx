import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useReportsStore } from "../../modules/reports/reports.store";
import {
    formatAmount,
    formatDate,
    todayISO,
} from "../../modules/reports/reports.utils";
import ReportHeader from "../../components/reports/ReportHeader";
import NoCompanySelected from "../../components/reports/NoCompanySelected";
import BalancedIndicator from "../../components/reports/BalancedIndicator";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function BalanceSheetPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = searchParams.get("company");
    const asOfDate = searchParams.get("date") ?? todayISO();

    const { balanceSheet, loadingBalanceSheet, fetchBalanceSheet } =
        useReportsStore();

    useEffect(() => {
        if (companyId) fetchBalanceSheet(companyId, asOfDate);
    }, [companyId, asOfDate, fetchBalanceSheet]);


    const handleDateChange = (date: string) => {
        if (companyId) setSearchParams({ company: companyId, date });
    };

    return (
        <div className="space-y-5">
            <ReportHeader
                title="Balance sheet"
                subtitle="Assets, liabilities, and equity as of a given date"
                rightContent={
                    companyId ? (
                        <div className="space-y-1">
                            <Label className="text-zinc-500 text-xs">
                                As of date
                            </Label>
                            <Input
                                type="date"
                                value={asOfDate}
                                onChange={(e) =>
                                    handleDateChange(e.target.value)
                                }
                                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-44"
                            />
                        </div>
                    ) : undefined
                }
            />

            {!companyId ? (
                <NoCompanySelected message="Select a client to view their balance sheet" />
            ) : loadingBalanceSheet ? (
                <div className="flex items-center justify-center py-20 text-zinc-500 text-sm rounded-lg border border-white/10 bg-zinc-900">
                    Loading balance sheet...
                </div>
            ) : !balanceSheet ? null : (
                <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                    {/* Sub-header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-zinc-500">
                            As of {formatDate(balanceSheet.as_of_date)}
                        </p>
                        <BalancedIndicator
                            isBalanced={balanceSheet.is_balanced}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-0 divide-x divide-white/10">
                        {/* Left — Assets */}
                        <div className="p-4 space-y-3">
                            <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                                Assets
                            </p>
                            {balanceSheet.assets.length === 0 ? (
                                <p className="text-sm text-zinc-600">
                                    No assets recorded
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {balanceSheet.assets.map((a) => (
                                        <div
                                            key={a.account_id}
                                            className="flex items-center justify-between py-1"
                                        >
                                            <span className="text-sm text-zinc-300">
                                                <span className="text-zinc-500 font-mono text-xs mr-2">
                                                    {a.code}
                                                </span>
                                                {a.name}
                                            </span>
                                            <span className="text-sm font-mono text-zinc-200">
                                                {formatAmount(a.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
                                <span className="text-xs font-medium text-zinc-400">
                                    Total assets
                                </span>
                                <span className="text-sm font-mono font-semibold text-blue-400">
                                    {formatAmount(balanceSheet.total_assets)}
                                </span>
                            </div>
                        </div>

                        {/* Right — Liabilities + Equity */}
                        <div className="p-4 space-y-5">
                            <div className="space-y-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                                    Liabilities
                                </p>
                                {balanceSheet.liabilities.length === 0 ? (
                                    <p className="text-sm text-zinc-600">
                                        No liabilities recorded
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {balanceSheet.liabilities.map((l) => (
                                            <div
                                                key={l.account_id}
                                                className="flex items-center justify-between py-1"
                                            >
                                                <span className="text-sm text-zinc-300">
                                                    <span className="text-zinc-500 font-mono text-xs mr-2">
                                                        {l.code}
                                                    </span>
                                                    {l.name}
                                                </span>
                                                <span className="text-sm font-mono text-zinc-200">
                                                    {formatAmount(l.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
                                    <span className="text-xs font-medium text-zinc-400">
                                        Total liabilities
                                    </span>
                                    <span className="text-sm font-mono font-semibold text-amber-400">
                                        {formatAmount(
                                            balanceSheet.total_liabilities,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
                                    Equity
                                </p>
                                {balanceSheet.equity.length === 0 ? (
                                    <p className="text-sm text-zinc-600">
                                        No equity recorded
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {balanceSheet.equity.map((e) => (
                                            <div
                                                key={e.account_id}
                                                className="flex items-center justify-between py-1"
                                            >
                                                <span className="text-sm text-zinc-300">
                                                    {e.code !== "—" && (
                                                        <span className="text-zinc-500 font-mono text-xs mr-2">
                                                            {e.code}
                                                        </span>
                                                    )}
                                                    {e.name}
                                                </span>
                                                <span className="text-sm font-mono text-zinc-200">
                                                    {formatAmount(e.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
                                    <span className="text-xs font-medium text-zinc-400">
                                        Total equity
                                    </span>
                                    <span className="text-sm font-mono font-semibold text-purple-400">
                                        {formatAmount(
                                            balanceSheet.total_equity,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer check */}
                    <div className="px-4 py-3 border-t border-white/10 bg-zinc-950/50 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                            Assets = Liabilities + Equity
                        </span>
                        <span className="text-sm font-mono text-zinc-300">
                            {formatAmount(balanceSheet.total_assets)} ={" "}
                            {formatAmount(
                                balanceSheet.total_liabilities +
                                    balanceSheet.total_equity,
                            )}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
