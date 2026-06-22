import { CheckCircle2, AlertCircle } from "lucide-react";

export default function BalancedIndicator({
    isBalanced,
}: {
    isBalanced: boolean;
}) {
    return isBalanced ? (
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Balanced
        </span>
    ) : (
        <span className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Out of balance
        </span>
    );
}
