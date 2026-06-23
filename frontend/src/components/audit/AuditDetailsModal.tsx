import type { AuditLog } from "../../modules/audit/audit.types";
import AuditActionBadge from "./AuditActionBadge";
import { formatTableName, formatDateTime } from "../../modules/audit/audit.utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../components/ui/dialog";

interface Props {
    open: boolean;
    onClose: () => void;
    log: AuditLog | null;
}

function JsonBlock({ label, data }: { label: string; data: unknown }) {
    if (!data) return null;
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">{label}</p>
            <pre className="text-xs bg-zinc-950 border border-white/10 rounded-md p-3 overflow-x-auto text-zinc-300 font-mono">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

export default function AuditDetailsModal({ open, onClose, log }: Props) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <div className="flex items-center gap-2.5 mb-1">
                        <AuditActionBadge action={log.action} />
                        <DialogTitle className="text-sm font-semibold text-zinc-100">
                            {formatTableName(log.table_name)}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-zinc-500 text-xs">
                        {formatDateTime(log.created_at)} by{" "}
                        {log.user_full_name || log.user_email || "System"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {log.record_id && (
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500">
                                Record ID
                            </p>
                            <p className="text-xs font-mono text-zinc-400 break-all">
                                {log.record_id}
                            </p>
                        </div>
                    )}

                    <JsonBlock label="Before" data={log.old_data} />
                    <JsonBlock label="After" data={log.new_data} />

                    {!log.old_data && !log.new_data && (
                        <p className="text-xs text-zinc-600">
                            No additional details recorded for this action.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
