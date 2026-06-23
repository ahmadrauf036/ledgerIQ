import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "../../modules/audit/audit.types";

interface Props {
    pagination: Pagination;
    onPageChange: (page: number) => void;
}

export default function AuditPagination({ pagination, onPageChange }: Props) {
    const { page, totalPages, total, limit } = pagination;

    if (total === 0) return null;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-xs text-zinc-500">
                Showing {start}–{end} of {total}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-zinc-400 px-2">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
