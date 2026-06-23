import { supabaseAdmin } from "../../lib/supabase";
import type {
    CreateAuditLogInput,
    GetAuditLogsQuery,
    AuditLogWithUser,
} from "./audit.types";

// ── Core logger — called internally by other modules ──
export const logAction = async (input: CreateAuditLogInput) => {
    try {
        const { error } = await supabaseAdmin.from("audit_logs").insert({
            company_id: input.company_id ?? null,
            user_id: input.user_id,
            action: input.action,
            table_name: input.table_name,
            record_id: input.record_id ?? null,
            old_data: input.old_data ?? null,
            new_data: input.new_data ?? null,
            ip_address: input.ip_address ?? null,
        });

        if (error) {
            // Audit logging should NEVER break the main flow
            // Log to console but don't throw
            console.error("Audit log failed:", error.message);
        }
    } catch (err) {
        console.error("Audit log failed:", (err as Error).message);
    }
};

// ── Get audit logs with filters + pagination ──────
export const getAuditLogs = async (query: GetAuditLogsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const offset = (page - 1) * limit;

    let baseQuery = supabaseAdmin
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (query.company_id) {
        baseQuery = baseQuery.eq("company_id", query.company_id);
    }
    if (query.user_id) {
        baseQuery = baseQuery.eq("user_id", query.user_id);
    }
    if (query.table_name) {
        baseQuery = baseQuery.eq("table_name", query.table_name);
    }
    if (query.action) {
        baseQuery = baseQuery.eq("action", query.action);
    }
    if (query.start_date) {
        baseQuery = baseQuery.gte("created_at", query.start_date);
    }
    if (query.end_date) {
        // Add a day to make end_date inclusive
        baseQuery = baseQuery.lte("created_at", `${query.end_date}T23:59:59`);
    }

    const { data: logs, error, count } = await baseQuery;

    if (error) throw new Error(error.message);

    // Enrich with user info
    const userIds = [
        ...new Set((logs ?? []).map((l) => l.user_id).filter(Boolean)),
    ];

    const userMap = new Map<
        string,
        { email: string; full_name: string | null }
    >();

    for (const userId of userIds) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
            userId!,
        );
        if (userData?.user) {
            userMap.set(userId!, {
                email: userData.user.email ?? "",
                full_name: userData.user.user_metadata?.full_name ?? null,
            });
        }
    }

    const enrichedLogs: AuditLogWithUser[] = (logs ?? []).map((log) => ({
        ...log,
        user_email: log.user_id
            ? (userMap.get(log.user_id)?.email ?? null)
            : null,
        user_full_name: log.user_id
            ? (userMap.get(log.user_id)?.full_name ?? null)
            : null,
    }));

    return {
        logs: enrichedLogs,
        pagination: {
            page,
            limit,
            total: count ?? 0,
            totalPages: Math.ceil((count ?? 0) / limit),
        },
    };
};

// ── Get logs for a specific record (e.g. one journal entry's history) ──
export const getRecordHistory = async (tableName: string, recordId: string) => {
    const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("*")
        .eq("table_name", tableName)
        .eq("record_id", recordId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const userIds = [
        ...new Set((data ?? []).map((l) => l.user_id).filter(Boolean)),
    ];
    const userMap = new Map<
        string,
        { email: string; full_name: string | null }
    >();

    for (const userId of userIds) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
            userId!,
        );
        if (userData?.user) {
            userMap.set(userId!, {
                email: userData.user.email ?? "",
                full_name: userData.user.user_metadata?.full_name ?? null,
            });
        }
    }

    return (data ?? []).map((log) => ({
        ...log,
        user_email: log.user_id
            ? (userMap.get(log.user_id)?.email ?? null)
            : null,
        user_full_name: log.user_id
            ? (userMap.get(log.user_id)?.full_name ?? null)
            : null,
    }));
};

// ── Get available filter options (for dropdowns in UI) ──
export const getFilterOptions = async () => {
    const { data, error } = await supabaseAdmin
        .from("audit_logs")
        .select("table_name, action");

    if (error) throw new Error(error.message);

    const tableNames = [
        ...new Set((data ?? []).map((d) => d.table_name)),
    ].sort();
    const actions = [...new Set((data ?? []).map((d) => d.action))].sort();

    return { table_names: tableNames, actions };
};
