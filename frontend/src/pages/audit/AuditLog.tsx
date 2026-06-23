import { useEffect, useState } from "react";
import { useAuditStore } from "../../modules/audit/audit.store";
import type { AuditLog, AuditFilters } from "../../modules/audit/audit.types";
import AuditFiltersBar from "../../components/audit/AuditFiltersBar";
import AuditTable from "../../components/audit/AuditTable";
import AuditDetailsModal from "../../components/audit/AuditDetailsModal";
import AuditPagination from "../../components/audit/AuditPagination";

export default function AuditLogPage() {
    const { logs, pagination, loading, fetchLogs } = useAuditStore();

    const [filters, setFilters] = useState<AuditFilters>({
        page: 1,
        limit: 50,
    });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        fetchLogs(filters);
    }, [filters,fetchLogs]);

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-zinc-100">
                    Activity log
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                    Track every action taken across the platform
                </p>
            </div>

            {/* Filters */}
            <AuditFiltersBar filters={filters} onChange={setFilters} />

            {/* Table */}
            <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                <AuditTable
                    logs={logs}
                    loading={loading}
                    onView={setSelectedLog}
                />
                {pagination && (
                    <AuditPagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Details modal */}
            <AuditDetailsModal
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </div>
    );
}
