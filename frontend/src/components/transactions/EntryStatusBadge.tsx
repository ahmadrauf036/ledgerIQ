import { Badge } from "../../components/ui/badge"
import type { EntryStatus } from "../../modules/transactions/transactions.types"

export default function EntryStatusBadge({ status }: { status: EntryStatus }) {
    return (
        <Badge
            variant="outline"
            className={
                status === "posted"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs"
            }
        >
            {status === "posted" ? "Posted" : "Draft"}
        </Badge>
    )
}