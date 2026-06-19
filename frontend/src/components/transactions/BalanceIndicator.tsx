import { CheckCircle2, AlertCircle } from "lucide-react"

interface Props {
    totalDebit: number
    totalCredit: number
}

function formatAmount(n: number): string {
    return n.toLocaleString("en-PK", { minimumFractionDigits: 0 })
}

export default function BalanceIndicator({ totalDebit, totalCredit }: Props) {
    const diff = totalDebit - totalCredit
    const isBalanced = Math.abs(diff) < 0.01

    return (
        <div
            className={`
                flex items-center justify-between
                rounded-md px-3 py-2 text-xs
                ${isBalanced
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }
            `}
        >
            <div className="flex items-center gap-4">
                <span className="text-zinc-400">
                    Total debit:{" "}
                    <span className="text-zinc-100 font-mono">
                        {formatAmount(totalDebit)}
                    </span>
                </span>
                <span className="text-zinc-400">
                    Total credit:{" "}
                    <span className="text-zinc-100 font-mono">
                        {formatAmount(totalCredit)}
                    </span>
                </span>
            </div>

            {isBalanced ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Balanced
                </span>
            ) : (
                <span className="flex items-center gap-1 text-red-400 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Out of balance by {formatAmount(Math.abs(diff))}
                </span>
            )}
        </div>
    )
}