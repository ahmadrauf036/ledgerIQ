import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type {
    TrialBalanceResponse,
    ProfitLossResponse,
    BalanceSheetResponse,
} from "./reports.types";

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

interface ReportsState {
    trialBalance: TrialBalanceResponse | null;
    profitLoss: ProfitLossResponse | null;
    balanceSheet: BalanceSheetResponse | null;
    loadingTrialBalance: boolean;
    loadingProfitLoss: boolean;
    loadingBalanceSheet: boolean;
    error: string | null;

    fetchTrialBalance: (companyId: string, asOfDate?: string) => Promise<void>;
    fetchProfitLoss: (
        companyId: string,
        startDate: string,
        endDate: string,
    ) => Promise<void>;
    fetchBalanceSheet: (companyId: string, asOfDate?: string) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set) => ({
    trialBalance: null,
    profitLoss: null,
    balanceSheet: null,
    loadingTrialBalance: false,
    loadingProfitLoss: false,
    loadingBalanceSheet: false,
    error: null,

    fetchTrialBalance: async (companyId, asOfDate) => {
        set({ loadingTrialBalance: true, error: null });
        try {
            const headers = await getHeaders();
            const params = new URLSearchParams({ company_id: companyId });
            if (asOfDate) params.append("as_of_date", asOfDate);

            const res = await fetch(
                `${API_URL}/reports/trial-balance?${params}`,
                { headers },
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ trialBalance: json.data, loadingTrialBalance: false });
        } catch (err) {
            set({ error: (err as Error).message, loadingTrialBalance: false });
        }
    },

    fetchProfitLoss: async (companyId, startDate, endDate) => {
        set({ loadingProfitLoss: true, error: null });
        try {
            const headers = await getHeaders();
            const params = new URLSearchParams({
                company_id: companyId,
                start_date: startDate,
                end_date: endDate,
            });

            const res = await fetch(
                `${API_URL}/reports/profit-loss?${params}`,
                { headers },
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ profitLoss: json.data, loadingProfitLoss: false });
        } catch (err) {
            set({ error: (err as Error).message, loadingProfitLoss: false });
        }
    },

    fetchBalanceSheet: async (companyId, asOfDate) => {
        set({ loadingBalanceSheet: true, error: null });
        try {
            const headers = await getHeaders();
            const params = new URLSearchParams({ company_id: companyId });
            if (asOfDate) params.append("as_of_date", asOfDate);

            const res = await fetch(
                `${API_URL}/reports/balance-sheet?${params}`,
                { headers },
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ balanceSheet: json.data, loadingBalanceSheet: false });
        } catch (err) {
            set({ error: (err as Error).message, loadingBalanceSheet: false });
        }
    },
}));
