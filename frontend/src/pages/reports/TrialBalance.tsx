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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

export default function TrialBalancePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = searchParams.get("company");
    const asOfDate = searchParams.get("date") ?? todayISO();

    const { trialBalance, loadingTrialBalance, fetchTrialBalance } =
        useReportsStore();

    useEffect(() => {
        if (companyId) fetchTrialBalance(companyId, asOfDate);
    }, [companyId, asOfDate, fetchTrialBalance]);


    const handleDateChange = (date: string) => {
        if (companyId) setSearchParams({ company: companyId, date });
    };

    return (
        <div className="space-y-5">
            <ReportHeader
                title="Trial balance"
                subtitle="Summary of all account balances as of a given date"
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
                <NoCompanySelected message="Select a client to view their trial balance" />
            ) : (
                <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                    {loadingTrialBalance ? (
                        <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                            Loading trial balance...
                        </div>
                    ) : !trialBalance || trialBalance.rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-2">
                            <p className="text-zinc-400 text-sm">
                                No posted transactions found
                            </p>
                            <p className="text-zinc-600 text-xs">
                                Post journal entries to see balances here
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Sub-header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                <p className="text-xs text-zinc-500">
                                    As of {formatDate(trialBalance.as_of_date)}
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
                                                    ? formatAmount(row.debit)
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm text-zinc-300">
                                                {row.credit > 0
                                                    ? formatAmount(row.credit)
                                                    : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <tfoot>
                                    <TableRow className="border-white/10 bg-zinc-950/50 hover:bg-zinc-950/50">
                                        <TableCell
                                            colSpan={2}
                                            className="text-xs font-medium text-zinc-400"
                                        >
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm font-semibold text-zinc-100">
                                            {formatAmount(
                                                trialBalance.total_debit,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm font-semibold text-zinc-100">
                                            {formatAmount(
                                                trialBalance.total_credit,
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </tfoot>
                            </Table>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
