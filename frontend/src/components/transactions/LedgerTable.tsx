import type { LedgerResponse } from "../../modules/transactions/transactions.types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"

interface Props {
    ledger: LedgerResponse
    loading: boolean
}

function formatAmount(n: number): string {
    return n > 0 ? n.toLocaleString("en-PK") : "—"
}

function formatBalance(n: number): string {
    const abs = Math.abs(n).toLocaleString("en-PK")
    return n < 0 ? `(${abs})` : abs
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export default function LedgerTable({ ledger, loading }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                Loading ledger...
            </div>
        )
    }

    if (ledger.rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
                <p className="text-zinc-400 text-sm">No posted transactions yet</p>
                <p className="text-zinc-600 text-xs">
                    Post a journal entry to see it here
                </p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400">Entry #</TableHead>
                    <TableHead className="text-zinc-400">Description</TableHead>
                    <TableHead className="text-zinc-400 text-right">Debit</TableHead>
                    <TableHead className="text-zinc-400 text-right">Credit</TableHead>
                    <TableHead className="text-zinc-400 text-right">Balance</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {ledger.rows.map((row, i) => (
                    <TableRow
                        key={`${row.entry_id}-${i}`}
                        className="border-white/10 hover:bg-white/5"
                    >
                        <TableCell className="text-zinc-300 text-sm">
                            {formatDate(row.date)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400">
                            {row.entry_number}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                            {row.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-zinc-300">
                            {formatAmount(row.debit)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-zinc-300">
                            {formatAmount(row.credit)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium text-zinc-100">
                            {formatBalance(row.running_balance)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <tfoot>
                <TableRow className="border-white/10 bg-zinc-950/50 hover:bg-zinc-950/50">
                    <TableCell colSpan={5} className="text-right text-xs font-medium text-zinc-400">
                        Closing balance
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-zinc-100">
                        {formatBalance(ledger.closing_balance)}
                    </TableCell>
                </TableRow>
            </tfoot>
        </Table>
    )
}