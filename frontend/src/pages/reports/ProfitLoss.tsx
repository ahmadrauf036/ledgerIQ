import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useReportsStore } from "../../modules/reports/reports.store";
import {
    formatAmount,
    formatDate,
    todayISO,
    firstDayOfMonth,
} from "../../modules/reports/reports.utils";
import ReportHeader from "../../components/reports/ReportHeader";
import NoCompanySelected from "../../components/reports/NoCompanySelected";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ProfitLossPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = searchParams.get("company");
    const startDate = searchParams.get("start") ?? firstDayOfMonth();
    const endDate = searchParams.get("end") ?? todayISO();

    const { profitLoss, loadingProfitLoss, fetchProfitLoss } =
        useReportsStore();

    useEffect(() => {
        if (companyId) fetchProfitLoss(companyId, startDate, endDate);
    }, [companyId, startDate, endDate, fetchProfitLoss]);

    const handleDateChange = (field: "start" | "end", value: string) => {
        if (!companyId) return;
        setSearchParams({
            company: companyId,
            start: field === "start" ? value : startDate,
            end: field === "end" ? value : endDate,
        });
    };

    const isProfit = (profitLoss?.net_profit ?? 0) >= 0;

    return (
        <div className="space-y-5">
            <ReportHeader
                title="Profit & loss"
                subtitle="Revenue and expenses for a selected period"
                rightContent={
                    companyId ? (
                        <div className="flex items-end gap-2">
                            <div className="space-y-1">
                                <Label className="text-zinc-500 text-xs">
                                    From
                                </Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        handleDateChange(
                                            "start",
                                            e.target.value,
                                        )
                                    }
                                    className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-40"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-zinc-500 text-xs">
                                    To
                                </Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) =>
                                        handleDateChange("end", e.target.value)
                                    }
                                    className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-40"
                                />
                            </div>
                        </div>
                    ) : undefined
                }
            />

            {!companyId ? (
                <NoCompanySelected message="Select a client to view their profit & loss statement" />
            ) : loadingProfitLoss ? (
                <div className="flex items-center justify-center py-20 text-zinc-500 text-sm rounded-lg border border-white/10 bg-zinc-900">
                    Loading profit & loss...
                </div>
            ) : !profitLoss ? null : (
                <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                    {/* Period header */}
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-zinc-500">
                            {formatDate(profitLoss.start_date)} —{" "}
                            {formatDate(profitLoss.end_date)}
                        </p>
                    </div>

                    <div className="p-4 space-y-5">
                        {/* Revenue */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-emerald-400 mb-2">
                                Revenue
                            </p>
                            {profitLoss.revenue.length === 0 ? (
                                <p className="text-sm text-zinc-600 px-1">
                                    No revenue recorded
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {profitLoss.revenue.map((r) => (
                                        <div
                                            key={r.account_id}
                                            className="flex items-center justify-between py-1 px-1"
                                        >
                                            <span className="text-sm text-zinc-300">
                                                <span className="text-zinc-500 font-mono text-xs mr-2">
                                                    {r.code}
                                                </span>
                                                {r.name}
                                            </span>
                                            <span className="text-sm font-mono text-zinc-200">
                                                {formatAmount(r.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 px-1">
                                <span className="text-xs font-medium text-zinc-400">
                                    Total revenue
                                </span>
                                <span className="text-sm font-mono font-semibold text-emerald-400">
                                    {formatAmount(profitLoss.total_revenue)}
                                </span>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-red-400 mb-2">
                                Expenses
                            </p>
                            {profitLoss.expenses.length === 0 ? (
                                <p className="text-sm text-zinc-600 px-1">
                                    No expenses recorded
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {profitLoss.expenses.map((e) => (
                                        <div
                                            key={e.account_id}
                                            className="flex items-center justify-between py-1 px-1"
                                        >
                                            <span className="text-sm text-zinc-300">
                                                <span className="text-zinc-500 font-mono text-xs mr-2">
                                                    {e.code}
                                                </span>
                                                {e.name}
                                            </span>
                                            <span className="text-sm font-mono text-zinc-200">
                                                {formatAmount(e.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 px-1">
                                <span className="text-xs font-medium text-zinc-400">
                                    Total expenses
                                </span>
                                <span className="text-sm font-mono font-semibold text-red-400">
                                    {formatAmount(profitLoss.total_expenses)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Net profit */}
                    <div
                        className={`px-4 py-3 border-t border-white/10 flex items-center justify-between ${
                            isProfit ? "bg-emerald-500/5" : "bg-red-500/5"
                        }`}
                    >
                        <span className="text-sm font-medium text-zinc-200">
                            {isProfit ? "Net profit" : "Net loss"}
                        </span>
                        <span
                            className={`text-base font-mono font-bold ${
                                isProfit ? "text-emerald-400" : "text-red-400"
                            }`}
                        >
                            {formatAmount(profitLoss.net_profit)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
