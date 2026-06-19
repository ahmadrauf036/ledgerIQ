import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTransactionsStore } from "../../modules/transactions/transactions.store"
import type { JournalEntry } from "../../modules/transactions/transactions.types"
import CompanySwitcher from "../../components/accounts/CompanySwitcher"
import JournalEntriesTable from "../../components/transactions/JournalEntriesTable"
import JournalEntryModal from "../../components/transactions/JournalEntryModal"
import EntryDetailsModal from "../../components/transactions/EntryDetailsModal"
import PostEntryDialog from "../../components/transactions/PostEntryDialog"
import DeleteEntryDialog from "../../components/transactions/DeleteEntryDialog"
import { Button } from "../../components/ui/button"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs"
import { Plus, BookText } from "lucide-react"

const STATUS_TABS = [
    { value: "all",    label: "All" },
    { value: "draft",  label: "Draft" },
    { value: "posted", label: "Posted" },
]

export default function JournalEntriesPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const companyId = searchParams.get("company")

    const { entries, loading, fetchEntries } = useTransactionsStore()

    const [activeTab, setActiveTab] = useState("all")
    const [entryModalOpen, setEntryModalOpen] = useState(false)
    const [entryModalMode, setEntryModalMode] = useState<"create" | "edit">("create")
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
    const [detailsEntryId, setDetailsEntryId] = useState<string | null>(null)
    const [postEntryTarget, setPostEntryTarget] = useState<JournalEntry | null>(null)
    const [deleteEntryTarget, setDeleteEntryTarget] = useState<JournalEntry | null>(null)

    useEffect(() => {
        if (companyId) {
            fetchEntries(companyId, activeTab === "all" ? undefined : activeTab)
        }
    }, [companyId, activeTab])

    const handleCompanyChange = (id: string) => {
        setSearchParams({ company: id })
    }

    const refetch = () => {
        if (companyId) {
            fetchEntries(companyId, activeTab === "all" ? undefined : activeTab)
        }
    }

    const handleNewEntry = () => {
        setEntryModalMode("create")
        setSelectedEntry(null)
        setEntryModalOpen(true)
    }

    const handleEdit = (entry: JournalEntry) => {
        setEntryModalMode("edit")
        setSelectedEntry(entry)
        setEntryModalOpen(true)
    }

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        Journal entries
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Record and manage bookkeeping transactions
                    </p>
                </div>
                {companyId && (
                    <Button
                        onClick={handleNewEntry}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New entry
                    </Button>
                )}
            </div>

            {/* Company switcher */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">Client:</span>
                <CompanySwitcher value={companyId} onChange={handleCompanyChange} />
            </div>

            {!companyId ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-lg border border-white/10 bg-zinc-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                        <BookText className="h-5 w-5 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400">
                        Select a client to view their journal entries
                    </p>
                </div>
            ) : (
                <>
                    {/* Status tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-zinc-800 border border-white/10">
                            {STATUS_TABS.map((tab) => (
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

                    {/* Table */}
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        <JournalEntriesTable
                            entries={entries}
                            loading={loading}
                            onView={(entry) => setDetailsEntryId(entry.id)}
                            onEdit={handleEdit}
                            onPost={setPostEntryTarget}
                            onDelete={setDeleteEntryTarget}
                        />
                    </div>
                </>
            )}

            {/* Modals */}
            {companyId && (
                <>
                    <JournalEntryModal
                        open={entryModalOpen}
                        onClose={() => setEntryModalOpen(false)}
                        companyId={companyId}
                        mode={entryModalMode}
                        entryId={selectedEntry?.id}
                        onSuccess={refetch}
                    />
                    <EntryDetailsModal
                        open={!!detailsEntryId}
                        onClose={() => setDetailsEntryId(null)}
                        entryId={detailsEntryId}
                    />
                    <PostEntryDialog
                        open={!!postEntryTarget}
                        onClose={() => setPostEntryTarget(null)}
                        entry={postEntryTarget}
                        onSuccess={refetch}
                    />
                    <DeleteEntryDialog
                        open={!!deleteEntryTarget}
                        onClose={() => setDeleteEntryTarget(null)}
                        entry={deleteEntryTarget}
                        onSuccess={refetch}
                    />
                </>
            )}

        </div>
    )
}