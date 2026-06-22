import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
    Outlet,
    useNavigate,
    useSearchParams,
    useLocation,
} from "react-router-dom";
import CompanySwitcher from "../../components/accounts/CompanySwitcher";

const TYPE_TABS: {
    value: "trial-balance" | "profit-loss" | "balance-sheet";
    label: string;
}[] = [
    { value: "trial-balance", label: "Trial Balance" },
    { value: "profit-loss", label: "Profit Loss" },
    { value: "balance-sheet", label: "Balance Sheet" },
];

const Reports = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = searchParams.get("company");

    // Derive active tab from current URL path instead of separate state
    const activeTab =
        (location.pathname.split("/").pop() as
            | "trial-balance"
            | "profit-loss"
            | "balance-sheet") || "trial-balance";

    const handleTabChange = (value: string) => {
        // Only allow known tab values, fallback to "trial-balance" if unknown
        const allowed = [
            "trial-balance",
            "profit-loss",
            "balance-sheet",
        ] as const;
        const tab = allowed.includes(
            value as "trial-balance" | "profit-loss" | "balance-sheet",
        )
            ? (value as "trial-balance" | "profit-loss" | "balance-sheet")
            : "trial-balance";

        // Preserve all existing search params when switching tabs
        const params = searchParams.toString();
        navigate(`/reports/${tab}${params ? `?${params}` : ""}`);
    };

    const handleCompanyChange = (id: string) => {
        // Only update company param, keep everything else (start/end/date)
        const params = new URLSearchParams(searchParams);
        params.set("company", id);
        setSearchParams(params);
    };

    return (
        <>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="bg-zinc-800 border border-white/10">
                    {TYPE_TABS.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="text-xs data-[state=active]:bg-zinc-700 text-zinc-400 data-[state=active]:text-zinc-100"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-3 my-4">
                <span className="text-xs text-zinc-500">Client:</span>
                <CompanySwitcher
                    value={companyId}
                    onChange={handleCompanyChange}
                />
            </div>

            <Outlet />
        </>
    );
};

export default Reports;
