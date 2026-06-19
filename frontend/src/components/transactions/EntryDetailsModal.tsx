import { useEffect } from "react"
import { useTransactionsStore } from "../../modules/transactions/transactions.store"
import EntryStatusBadge from "./EntryStatusBadge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"

interface Props {
    open: boolean
    onClose: () => void
    entryId: string | null
}

function formatAmount(n: number): string {
    return n > 0 ? n.toLocaleString("en-PK") : "—"
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

export default function EntryDetailsModal({ open, onClose, entryId }: Props) {
    const { currentEntry, fetchEntryById, clearCurrentEntry, loadingEntry } =
        useTransactionsStore()

    useEffect(() => {
        if (open && entryId) fetchEntryById(entryId)
        if (!open) clearCurrentEntry()
    }, [open, entryId])

    const totalDebit =
        currentEntry?.lines.reduce((sum, l) => sum + l.debit, 0) ?? 0
    const totalCredit =
        currentEntry?.lines.reduce((sum, l) => sum + l.credit, 0) ?? 0

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-zinc-900 text-zinc-100 border border-white/10 p-0 overflow-hidden">
                {loadingEntry || !currentEntry ? (
                    <div className="py-12 text-center text-sm text-zinc-500">
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/10">
                            <div className="flex items-baseline-last justify-between">
                                <div>
                                    <DialogTitle className="text-sm font-mono text-zinc-100">
                                        {currentEntry.entry_number}
                                    </DialogTitle>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {formatDate(currentEntry.date)}
                                    </p>
                                </div>
                                <EntryStatusBadge  status={currentEntry.status} />
                            </div>
                            {currentEntry.description && (
                                <p className="text-sm text-zinc-300 mt-2">
                                    {currentEntry.description}
                                </p>
                            )}
                        </DialogHeader>

                        {/* Lines */}
                        <div className="px-5 py-3">
                            <div className="grid grid-cols-[1fr_90px_90px] gap-2 px-0.5 mb-1.5">
                                <span className="text-xs text-zinc-500">Account</span>
                                <span className="text-xs text-zinc-500 text-right">Debit</span>
                                <span className="text-xs text-zinc-500 text-right">Credit</span>
                            </div>
                            <div className="space-y-1">
                                {currentEntry.lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="grid grid-cols-[1fr_90px_90px] gap-2 py-1.5 border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-sm text-zinc-200 truncate">
                                            <span className="text-zinc-500 font-mono text-xs mr-1.5">
                                                {line.account_code}
                                            </span>
                                            {line.account_name}
                                        </span>
                                        <span className="text-sm font-mono text-zinc-300 text-right">
                                            {formatAmount(line.debit)}
                                        </span>
                                        <span className="text-sm font-mono text-zinc-300 text-right">
                                            {formatAmount(line.credit)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="grid grid-cols-[1fr_90px_90px] gap-2 pt-2 mt-1 border-t border-white/10">
                                <span className="text-xs font-medium text-zinc-400">
                                    Total
                                </span>
                                <span className="text-sm font-mono font-medium text-zinc-100 text-right">
                                    {totalDebit.toLocaleString("en-PK")}
                                </span>
                                <span className="text-sm font-mono font-medium text-zinc-100 text-right">
                                    {totalCredit.toLocaleString("en-PK")}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-white/10 bg-zinc-950/50">
                            <p className="text-xs text-zinc-600">
                                {currentEntry.status === "posted" && currentEntry.posted_at
                                    ? `Posted on ${formatDate(currentEntry.posted_at)}`
                                    : "Not yet posted"}
                            </p>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}