import type { AuditLog } from "../../modules/audit/audit.types";
import AuditActionBadge from "./AuditActionBadge";
import {
    formatTableName,
    formatRelativeTime,
} from "../../modules/audit/audit.utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

interface Props {
    logs: AuditLog[];
    loading: boolean;
    onView: (log: AuditLog) => void;
}

export default function AuditTable({ logs, loading, onView }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                Loading activity log...
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
                <p className="text-zinc-400 text-sm">No activity found</p>
                <p className="text-zinc-600 text-xs">
                    Actions taken in the platform will appear here
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400">When</TableHead>
                    <TableHead className="text-zinc-400">User</TableHead>
                    <TableHead className="text-zinc-400">Action</TableHead>
                    <TableHead className="text-zinc-400">Module</TableHead>
                    <TableHead className="text-zinc-400">Record</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                    <TableRow
                        key={log.id}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => onView(log)}
                    >
                        <TableCell className="text-zinc-400 text-xs whitespace-nowrap">
                            {formatRelativeTime(log.created_at)}
                        </TableCell>
                        <TableCell className="text-zinc-300 text-sm">
                            {log.user_full_name || log.user_email || (
                                <span className="text-zinc-600">System</span>
                            )}
                        </TableCell>
                        <TableCell>
                            <AuditActionBadge action={log.action} />
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                            {formatTableName(log.table_name)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-500 truncate max-w-35">
                            {log.record_id ?? "—"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
