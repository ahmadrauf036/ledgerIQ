import { useEffect, useState } from "react";
import { useAuthStore } from "../../modules/auth/auth.store";
import { useAccountsStore } from "../../modules/accounts/accounts.store";
import type { Account, AccountType } from "../../modules/accounts/accounts.types";
import AccountTreeRow from "../../components/accounts/AccountTreeRow";
import AccountModal from "../../components/accounts/AccountModal";
import DeactivateAccountDialog from "../../components/accounts/DeactivateAccountDialog";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus } from "lucide-react";

const TYPE_TABS: { value: AccountType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "asset", label: "Assets" },
    { value: "liability", label: "Liabilities" },
    { value: "equity", label: "Equity" },
    { value: "revenue", label: "Revenue" },
    { value: "expense", label: "Expenses" },
];

export default function MyAccountsPage() {
    const { companyId, role } = useAuthStore();
    const { accounts, loading, fetchAccounts } = useAccountsStore();
    const canEdit = role === "bookkeeper";

    const [activeTab, setActiveTab] = useState<AccountType | "all">("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(
        null,
    );
    const [defaultParent, setDefaultParent] = useState<Account | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<Account | null>(
        null,
    );

    useEffect(() => {
        if (companyId) {
            fetchAccounts(
                companyId,
                activeTab === "all" ? undefined : activeTab,
            );
        }
    }, [companyId, activeTab, fetchAccounts]);

    const refetch = () => {
        if (companyId) {
            fetchAccounts(
                companyId,
                activeTab === "all" ? undefined : activeTab,
            );
        }
    };

    const handleAdd = () => {
        setModalMode("create");
        setSelectedAccount(null);
        setDefaultParent(null);
        setModalOpen(true);
    };

    const handleAddChild = (parent: Account) => {
        setModalMode("create");
        setSelectedAccount(null);
        setDefaultParent(parent);
        setModalOpen(true);
    };

    const handleEdit = (account: Account) => {
        setModalMode("edit");
        setSelectedAccount(account);
        setDefaultParent(null);
        setModalOpen(true);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        Chart of accounts
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        {canEdit
                            ? "Manage your company's account structure"
                            : "View your company's account structure"}
                    </p>
                </div>
                {canEdit && (
                    <Button
                        onClick={handleAdd}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add account
                    </Button>
                )}
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as AccountType | "all")}
            >
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

            <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                        Loading accounts...
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <p className="text-zinc-400 text-sm">
                            No accounts found
                        </p>
                    </div>
                ) : (
                    <div className="py-2">
                        {accounts.map((account) => (
                            <AccountTreeRow
                                ledgerBasePath="/my-ledger"
                                key={account.id}
                                account={account}
                                depth={0}
                                readOnly={!canEdit}
                                onEdit={handleEdit}
                                onDeactivate={setDeactivateTarget}
                                onAddChild={handleAddChild}
                            />
                        ))}
                    </div>
                )}
            </div>

            {canEdit && (
                <>
                    <AccountModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        companyId={companyId!}
                        mode={modalMode}
                        account={selectedAccount}
                        defaultParent={defaultParent}
                        onSuccess={refetch}
                    />
                    <DeactivateAccountDialog
                        open={!!deactivateTarget}
                        onClose={() => setDeactivateTarget(null)}
                        account={deactivateTarget}
                        onSuccess={refetch}
                    />
                </>
            )}
        </div>
    );
}
