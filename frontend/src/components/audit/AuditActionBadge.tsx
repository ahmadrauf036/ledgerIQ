import { Badge } from "../../components/ui/badge";
import type { AuditAction } from "../../modules/audit/audit.types";
import { actionConfig } from "../../modules/audit/audit.utils";

export default function AuditActionBadge({ action }: { action: AuditAction }) {
    const config = actionConfig[action] ?? {
        label: action,
        className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };

    return (
        <Badge variant="outline" className={`text-xs ${config.className}`}>
            {config.label}
        </Badge>
    );
}
