import { Badge } from "../ui/badge";
import type { AccountType } from "../../modules/accounts/accounts.types";

const typeConfig: Record<AccountType, { label: string; className: string }> = {
    asset: {
        label: "Asset",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    liability: {
        label: "Liability",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    equity: {
        label: "Equity",
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    revenue: {
        label: "Revenue",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    expense: {
        label: "Expense",
        className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
};

export default function AccountTypeBadge({ type }: { type: AccountType }) {
    const config = typeConfig[type];
    return (
        <Badge variant="outline" className={`text-xs ${config.className}`}>
            {config.label}
        </Badge>
    );
}
