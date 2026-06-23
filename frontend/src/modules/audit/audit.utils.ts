import type { AuditAction } from "./audit.types";

export const actionConfig: Record<
    AuditAction,
    { label: string; className: string }
> = {
    CREATE: {
        label: "Created",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    UPDATE: {
        label: "Updated",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    DELETE: {
        label: "Deleted",
        className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    LOGIN: {
        label: "Login",
        className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
    POST: {
        label: "Posted",
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    DEACTIVATE: {
        label: "Deactivated",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    ACTIVATE: {
        label: "Activated",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    INVITE: {
        label: "Invited",
        className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
}

export const tableLabels: Record<string, string> = {
    companies: "Client",
    accounts: "Account",
    journal_entries: "Journal Entry",
    invites: "Invite",
    users: "User",
    entry_lines: "Entry Line",
}

export function formatTableName(tableName: string): string {
    return tableLabels[tableName] ?? tableName
}

export function formatDateTime(date: string): string {
    return new Date(date).toLocaleString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function formatRelativeTime(date: string): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDateTime(date)
}