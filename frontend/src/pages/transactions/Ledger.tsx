import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useTransactionsStore } from "../../modules/transactions/transactions.store"
import LedgerTable from "../../components/transactions/LedgerTable"
import { BookOpen } from "lucide-react"

export default function LedgerPage() {
    const [searchParams] = useSearchParams()
    const accountId = searchParams.get("account")

    const { ledger, loadingLedger, fetchLedger } = useTransactionsStore()

    useEffect(() => {
        if (accountId) fetchLedger(accountId)
    }, [accountId])

    if (!accountId) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-lg border border-white/10 bg-zinc-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                    <BookOpen className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-400">
                    Select an account from Chart of Accounts to view its ledger
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-zinc-100">
                    Account ledger
                </h1>
                {ledger && (
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {ledger.account.code} — {ledger.account.name}
                    </p>
                )}
            </div>

            <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                {ledger ? (
                    <LedgerTable ledger={ledger} loading={loadingLedger} />
                ) : (
                    <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                        Loading...
                    </div>
                )}
            </div>
        </div>
    )
}