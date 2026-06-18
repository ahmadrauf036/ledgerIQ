import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccountsStore } from "../../modules/accounts/accounts.store";
import type { Account, AccountType } from "../../modules/accounts/accounts.types";
import CompanySwitcher from "../../components/accounts/CompanySwitcher";
import AccountTreeRow from "../../components/accounts/AccountTreeRow";
import AccountModal from "../../components/accounts/AccountModal";
import DeactivateAccountDialog from "../../components/accounts/DeactivateAccountDialog";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, BookOpen } from "lucide-react";
import { Spinner } from "../../components/ui/spinner";

const TYPE_TABS: { value: AccountType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "asset", label: "Assets" },
    { value: "liability", label: "Liabilities" },
    { value: "equity", label: "Equity" },
    { value: "revenue", label: "Revenue" },
    { value: "expense", label: "Expenses" },
];

export default function ChartOfAccountsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = searchParams.get("company");

    const { accounts, loading, fetchAccounts } = useAccountsStore();

    const [activeTab, setActiveTab] = useState<AccountType | "all">("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(
        null,
    );
    const [defaultParent, setDefaultParent] = useState<Account | null>(null);
    const [deactivateAccount, setDeactivateAccount] = useState<Account | null>(
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

    const handleCompanyChange = (id: string) => {
        setSearchParams({ company: id });
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

    const refetch = () => {
        if (companyId) {
            fetchAccounts(
                companyId,
                activeTab === "all" ? undefined : activeTab,
            );
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        Chart of accounts
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Manage the account structure for your clients
                    </p>
                </div>
                {companyId && (
                    <Button
                        onClick={handleAdd}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add account
                    </Button>
                )}
            </div>

            {/* Company switcher */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">Client:</span>
                <CompanySwitcher
                    value={companyId}
                    onChange={handleCompanyChange}
                />
            </div>

            {!companyId ? (
                /* No company selected state */
                <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-lg border border-white/10 bg-zinc-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                        <BookOpen className="h-5 w-5 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400">
                        Select a client to view their chart of accounts
                    </p>
                </div>
            ) : (
                <>
                    {/* Type tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(v as AccountType | "all")
                        }
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

                    {/* Accounts tree */}
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                                <Spinner className="mr-1"/>Loading accounts...
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-2">
                                <p className="text-zinc-400 text-sm">
                                    No accounts found
                                </p>
                                <p className="text-zinc-600 text-xs">
                                    Click "Add account" to create one
                                </p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {accounts.map((account) => (
                                    <AccountTreeRow
                                        key={account.id}
                                        account={account}
                                        depth={0}
                                        onEdit={handleEdit}
                                        onDeactivate={setDeactivateAccount}
                                        onAddChild={handleAddChild}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            {companyId && (
                <>
                    <AccountModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        companyId={companyId}
                        mode={modalMode}
                        account={selectedAccount}
                        defaultParent={defaultParent}
                        onSuccess={refetch}
                    />
                    <DeactivateAccountDialog
                        open={!!deactivateAccount}
                        onClose={() => setDeactivateAccount(null)}
                        account={deactivateAccount}
                        onSuccess={refetch}
                    />
                </>
            )}
        </div>
    );
}
