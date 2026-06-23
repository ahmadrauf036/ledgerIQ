import { useEffect } from "react";
import { useAuditStore } from "../../modules/audit/audit.store";
import { formatTableName } from "../../modules/audit/audit.utils";
import CompanySwitcher from "../../components/accounts/CompanySwitcher";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { X } from "lucide-react";
import type { AuditFilters, AuditAction } from "../../modules/audit/audit.types";

interface Props {
    filters: AuditFilters;
    onChange: (filters: AuditFilters) => void;
}

export default function AuditFiltersBar({ filters, onChange }: Props) {
    const { filterOptions, fetchFilterOptions } = useAuditStore();

    useEffect(() => {
        if (!filterOptions) fetchFilterOptions();
    }, [fetchFilterOptions,filterOptions]);

    const hasActiveFilters =
        filters.company_id ||
        filters.table_name ||
        filters.action ||
        filters.start_date ||
        filters.end_date;

    const handleClear = () => {
        onChange({ page: 1, limit: filters.limit });
    };

    return (
        <div className="flex items-end gap-3 flex-wrap">
            {/* Company */}
            <div className="space-y-1">
                <Label className="text-zinc-500 text-xs">Client</Label>
                <CompanySwitcher
                    value={filters.company_id ?? null}
                    onChange={(id) =>
                        onChange({ ...filters, company_id: id, page: 1 })
                    }
                />
            </div>

            {/* Table */}
            <div className="space-y-1">
                <Label className="text-zinc-500 text-xs">Module</Label>
                <Select
                    value={filters.table_name ?? "all"}
                    onValueChange={(val) =>
                        onChange({
                            ...filters,
                            table_name: val === "all" ? undefined : val,
                            page: 1,
                        })
                    }
                >
                    <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-40">
                        <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                        <SelectItem
                            value="all"
                            className="text-zinc-100 focus:bg-zinc-700 text-sm"
                        >
                            All modules
                        </SelectItem>
                        {filterOptions?.table_names.map((t) => (
                            <SelectItem
                                key={t}
                                value={t}
                                className="text-zinc-100 focus:bg-zinc-700 text-sm"
                            >
                                {formatTableName(t)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Action */}
            <div className="space-y-1">
                <Label className="text-zinc-500 text-xs">Action</Label>
                <Select
                    value={filters.action ?? "all"}
                    onValueChange={(val) =>
                        onChange({
                            ...filters,
                            action:
                                val === "all"
                                    ? undefined
                                    : (val as AuditAction),
                            page: 1,
                        })
                    }
                >
                    <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-36">
                        <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                        <SelectItem
                            value="all"
                            className="text-zinc-100 focus:bg-zinc-700 text-sm"
                        >
                            All actions
                        </SelectItem>
                        {filterOptions?.actions.map((a) => (
                            <SelectItem
                                key={a}
                                value={a}
                                className="text-zinc-100 focus:bg-zinc-700 text-sm"
                            >
                                {a}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Date range */}
            <div className="space-y-1">
                <Label className="text-zinc-500 text-xs">From</Label>
                <Input
                    type="date"
                    value={filters.start_date ?? ""}
                    onChange={(e) =>
                        onChange({
                            ...filters,
                            start_date: e.target.value || undefined,
                            page: 1,
                        })
                    }
                    className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-36"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-zinc-500 text-xs">To</Label>
                <Input
                    type="date"
                    value={filters.end_date ?? ""}
                    onChange={(e) =>
                        onChange({
                            ...filters,
                            end_date: e.target.value || undefined,
                            page: 1,
                        })
                    }
                    className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm w-36"
                />
            </div>

            {/* Clear */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-9 gap-1.5 text-xs"
                >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                </Button>
            )}
        </div>
    );
}
