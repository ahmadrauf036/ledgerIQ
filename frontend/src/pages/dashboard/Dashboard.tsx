import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/auth.store";
import { useClientsStore } from "../../modules/clients/clients.store";
import { supabase } from "../../lib/supabase.utils";
import {
    Users,
    BookOpen,
    BookText,
    FileBarChart,
 
    Clock,
    CheckCircle2,
    FolderOpen,
    History,
    ArrowRight,
    Activity,
} from "lucide-react";
import type { Client } from "../../modules/clients/clients.types";

interface DashboardStats {
    totalClients: number;
    activeClients: number;
    pendingInvites: number;
    totalEntries: number;
    postedEntries: number;
    draftEntries: number;
    totalFiles: number;
    recentActivity: RecentAction[];
}

interface RecentAction {
    id: string;
    action: string;
    table_name: string;
    created_at: string;
    user_email: string | null;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = async () => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
    };
};

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    color = "zinc",
    onClick,
}: {
    label: string;
    value: number | string;
    sub?: string;
    icon: React.ElementType;
    color?: "emerald" | "blue" | "amber" | "red" | "purple" | "zinc";
    onClick?: () => void;
}) {
    const colors = {
        emerald: "bg-emerald-500/10 text-emerald-400",
        blue: "bg-blue-500/10 text-blue-400",
        amber: "bg-amber-500/10 text-amber-400",
        red: "bg-red-500/10 text-red-400",
        purple: "bg-purple-500/10 text-purple-400",
        zinc: "bg-zinc-500/10 text-zinc-400",
    };

    return (
        <div
            onClick={onClick}
            className={`
                rounded-lg border border-white/10 bg-zinc-900 p-5 space-y-3
                ${onClick ? "cursor-pointer hover:bg-white/5 transition-colors" : ""}
            `}
        >
            <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">{label}</p>
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${colors[color]}`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div>
                <p className="text-2xl font-semibold text-zinc-100">{value}</p>
                {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function QuickAction({
    label,
    description,
    icon: Icon,
    color,
    onClick,
}: {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group w-full text-left flex items-center gap-4 rounded-lg border border-white/10 bg-zinc-900 hover:bg-white/5 p-4 transition-colors"
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${color}`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
    );
}

function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function formatTableName(name: string): string {
    const map: Record<string, string> = {
        companies: "Client",
        accounts: "Account",
        journal_entries: "Journal entry",
        invites: "Invite",
        users: "User",
        files: "File",
        file_folders: "Folder",
    };
    return map[name] ?? name;
}

const actionColors: Record<string, string> = {
    CREATE: "text-emerald-400",
    POST: "text-blue-400",
    UPDATE: "text-amber-400",
    DELETE: "text-red-400",
    INVITE: "text-purple-400",
    DEACTIVATE: "text-orange-400",
    ACTIVATE: "text-teal-400",
};

export function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { clients, fetchClients } = useClientsStore();

    const [stats, setStats] = useState<DashboardStats>({
        totalClients: 0,
        activeClients: 0,
        pendingInvites: 0,
        totalEntries: 0,
        postedEntries: 0,
        draftEntries: 0,
        totalFiles: 0,
        recentActivity: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
        fetchStats();
    }, [fetchClients]);

    // Sync client stats from store once clients load
    useEffect(() => {
        if (clients.length > 0) {
            setStats((prev) => ({
                ...prev,
                totalClients: clients.length,
                activeClients: clients.filter((c: Client) => c.is_active)
                    .length,
                pendingInvites: clients.filter(
                    (c: Client) => c.invite_status === "pending",
                ).length,
            }));
        }
    }, [clients]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const headers = await getHeaders();

            // Fetch all entries across all companies to get platform-wide counts
            // We do this by fetching audit log stats and recent activity
            const [auditRes] = await Promise.all([
                fetch(`${API_URL}/audit?limit=10`, { headers }),
            ]);

            if (auditRes.ok) {
                const auditJson = await auditRes.json();
                const logs = auditJson.data?.logs ?? [];

                // Count actions from audit log
                const entries = logs.filter(
                    (l: RecentAction) => l.table_name === "journal_entries",
                );
                const posted = entries.filter(
                    (l: RecentAction) => l.action === "POST",
                );
                const files = logs.filter(
                    (l: RecentAction) => l.table_name === "files",
                );

                setStats((prev) => ({
                    ...prev,
                    postedEntries: posted.length,
                    totalFiles: files.length,
                    recentActivity: logs.slice(0, 8),
                }));
            }
        } catch (err) {
            console.error("Dashboard stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    const activeCount = clients.filter((c: Client) => c.is_active).length;
    const pendingCount = clients.filter(
        (c: Client) => c.invite_status === "pending",
    ).length;
    const acceptedCount = clients.filter(
        (c: Client) => c.invite_status === "accepted",
    ).length;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-zinc-100">
                    {greeting()}
                    {user?.user_metadata?.full_name
                        ? `, ${user.user_metadata.full_name}`
                        : ""}
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                    Here's what's happening across your platform today
                </p>
            </div>

            {/* Stats grid */}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
                    Overview
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Total clients"
                        value={clients.length}
                        sub={`${activeCount} active`}
                        icon={Users}
                        color="blue"
                        onClick={() => navigate("/clients")}
                    />
                    <StatCard
                        label="Pending invites"
                        value={pendingCount}
                        sub={`${acceptedCount} accepted`}
                        icon={Clock}
                        color="amber"
                        onClick={() => navigate("/clients")}
                    />
                    <StatCard
                        label="Posted entries"
                        value={stats.postedEntries}
                        sub="across all clients"
                        icon={CheckCircle2}
                        color="emerald"
                    />
                    <StatCard
                        label="Files shared"
                        value={stats.totalFiles}
                        sub="across all clients"
                        icon={FolderOpen}
                        color="purple"
                    />
                </div>
            </div>

            {/* Client breakdown */}
            {clients.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Client overview
                        </p>
                        <button
                            onClick={() => navigate("/clients")}
                            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                        >
                            View all <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">
                                        Company
                                    </th>
                                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">
                                        Currency
                                    </th>
                                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">
                                        Status
                                    </th>
                                    <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">
                                        Invite
                                    </th>
                                    <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients
                                    .slice(0, 5)
                                    .map((client: Client, idx) => (
                                        <tr
                                            key={client.id}
                                            className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${idx % 2 === 1 ? "bg-white/2" : ""}`}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-zinc-100">
                                                    {client.company_name}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {client.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-mono text-zinc-400">
                                                    {client.currency}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                                                        client.is_active
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}
                                                >
                                                    {client.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                                                        client.invite_status ===
                                                        "accepted"
                                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    }`}
                                                >
                                                    {client.invite_status ===
                                                    "accepted"
                                                        ? "Accepted"
                                                        : "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/accounts?company=${client.id}`,
                                                        )
                                                    }
                                                    className="text-xs text-zinc-500 hover:text-zinc-200 flex items-center gap-1 ml-auto"
                                                >
                                                    Open{" "}
                                                    <ArrowRight className="h-3 w-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bottom row — Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick actions */}
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
                        Quick actions
                    </p>
                    <div className="space-y-2">
                        <QuickAction
                            label="Add a new client"
                            description="Create a client company and send invite"
                            icon={Users}
                            color="bg-blue-500/10 text-blue-400"
                            onClick={() => navigate("/clients")}
                        />
                        <QuickAction
                            label="Record a journal entry"
                            description="Post a transaction to a client's books"
                            icon={BookText}
                            color="bg-emerald-500/10 text-emerald-400"
                            onClick={() => navigate("/transactions")}
                        />
                        <QuickAction
                            label="View financial reports"
                            description="Trial balance, P&L, and balance sheet"
                            icon={FileBarChart}
                            color="bg-purple-500/10 text-purple-400"
                            onClick={() => navigate("/reports/trial-balance")}
                        />
                        <QuickAction
                            label="Chart of accounts"
                            description="Browse or update account structures"
                            icon={BookOpen}
                            color="bg-amber-500/10 text-amber-400"
                            onClick={() => navigate("/accounts")}
                        />
                        <QuickAction
                            label="Activity log"
                            description="See all recent platform actions"
                            icon={History}
                            color="bg-zinc-500/10 text-zinc-400"
                            onClick={() => navigate("/audit")}
                        />
                    </div>
                </div>

                {/* Recent activity */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Recent activity
                        </p>
                        <button
                            onClick={() => navigate("/audit")}
                            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                        >
                            View all <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">
                                Loading activity...
                            </div>
                        ) : stats.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <Activity className="h-5 w-5 text-zinc-600" />
                                <p className="text-zinc-500 text-sm">
                                    No activity yet
                                </p>
                                <p className="text-zinc-600 text-xs">
                                    Actions will appear here as you use the
                                    platform
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {stats.recentActivity.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5"
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 mt-0.5">
                                            <Activity className="h-3 w-3 text-zinc-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-zinc-300">
                                                <span
                                                    className={`font-medium ${actionColors[log.action] ?? "text-zinc-400"}`}
                                                >
                                                    {log.action}
                                                </span>
                                                {" — "}
                                                {formatTableName(
                                                    log.table_name,
                                                )}
                                            </p>
                                            <p className="text-xs text-zinc-600 mt-0.5">
                                                {log.user_email ?? "System"} ·{" "}
                                                {formatRelativeTime(
                                                    log.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
