import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/auth.store";
import { useAccountsStore } from "../../modules/accounts/accounts.store";
import { useTransactionsStore } from "../../modules/transactions/transactions.store";
import {
    BookOpen,
    BookText,
    FileBarChart,
    FolderOpen,
    ArrowRight,
} from "lucide-react";

export default function MyDashboard() {
    const navigate = useNavigate();
    const { role, companyId, user } = useAuthStore();
    const { accounts, fetchAccounts } = useAccountsStore();
    const { entries, fetchEntries } = useTransactionsStore();

    useEffect(() => {
        if (companyId) {
            fetchAccounts(companyId);
            fetchEntries(companyId);
        }
    }, [companyId, fetchAccounts, fetchEntries]);

    const draftCount = entries.filter((e) => e.status === "draft").length;
    const postedCount = entries.filter((e) => e.status === "posted").length;

    const cards = [
        {
            title: "Chart of accounts",
            description:
                role === "bookkeeper"
                    ? "Manage account structure"
                    : "View your account structure",
            icon: BookOpen,
            url: `/my-accounts`,
            stat: `${accounts.length} accounts`,
            visible: true,
        },
        {
            title: "Journal entries",
            description:
                role === "bookkeeper"
                    ? "Record and manage transactions"
                    : "View recorded transactions",
            icon: BookText,
            url: `/my-transactions`,
            stat: `${postedCount} posted, ${draftCount} draft`,
            visible: true,
        },
        {
            title: "Reports",
            description: "Trial balance, profit & loss, balance sheet",
            icon: FileBarChart,
            url: `/my-reports`,
            stat: "View financial reports",
            visible: role === "client_owner",
        },
        {
            title: "Files",
            description: "Share and access documents",
            icon: FolderOpen,
            url: `/my-files`,
            stat: "Upload and download files",
            visible: true,
        },
    ].filter((c) => c.visible);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-zinc-100">
                    Welcome back
                    {user?.user_metadata?.full_name
                        ? `, ${user.user_metadata.full_name}`
                        : ""}
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5 capitalize">
                    {role?.replace("_", " ")}
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map((card) => (
                    <button
                        key={card.title}
                        onClick={() => navigate(card.url)}
                        className="group text-left rounded-lg border border-white/10 bg-zinc-900 hover:bg-white/5 p-5 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/20">
                                <card.icon className="h-5 w-5 text-emerald-400" />
                            </div>
                            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <h3 className="text-sm font-medium text-zinc-100 mt-4">
                            {card.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                            {card.description}
                        </p>
                        <p className="text-xs text-zinc-600 mt-3">
                            {card.stat}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
