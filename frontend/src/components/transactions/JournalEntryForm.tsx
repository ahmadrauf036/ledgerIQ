import { useState, useEffect } from "react"

import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { JournalEntryWithLines } from "../../modules/transactions/transactions.types"
import { useAccountsStore } from "../../modules/accounts/accounts.store"
import { useTransactionsStore } from "../../modules/transactions/transactions.store"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import EntryLineRow from "./EntryLineRow"
import { Button } from "../ui/button"
import BalanceIndicator from "./BalanceIndicator"

interface LineValue {
    account_id: string
    debit: number
    credit: number
    description?: string
}

interface Props {
    companyId: string
    mode: "create" | "edit"
    existingEntry?: JournalEntryWithLines | null
    onSuccess: () => void
    onCancel: () => void
}

const emptyLine = (): LineValue => ({
    account_id: "",
    debit: 0,
    credit: 0,
})

export default function JournalEntryForm({
    companyId,
    mode,
    existingEntry,
    onSuccess,
    onCancel,
}: Props) {
    const { flatAccounts, fetchAccounts } = useAccountsStore()
    const { createEntry, updateEntry, postEntry, creating, updating, posting } =
        useTransactionsStore()

    const [date, setDate] = useState(
        existingEntry?.date ?? new Date().toISOString().split("T")[0]
    )
    const [description, setDescription] = useState(
        existingEntry?.description ?? ""
    )
    const [lines, setLines] = useState<LineValue[]>(
        existingEntry?.lines?.length
            ? existingEntry.lines.map((l) => ({
                  account_id: l.account_id,
                  debit: l.debit,
                  credit: l.credit,
                  description: l.description ?? undefined,
              }))
            : [emptyLine(), emptyLine()]
    )

    useEffect(() => {
        if (flatAccounts.length === 0) {
            fetchAccounts(companyId)
        }
    }, [companyId])

    const activeAccounts = flatAccounts.filter((a) => a.is_active)

    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01
    const allAccountsSelected = lines.every((l) => l.account_id)
    const hasMinLines = lines.length >= 2
    const canSave = isBalanced && allAccountsSelected && hasMinLines && totalDebit > 0

    const handleLineChange = (index: number, updated: LineValue) => {
        setLines((prev) => prev.map((l, i) => (i === index ? updated : l)))
    }

    const handleAddLine = () => {
        setLines((prev) => [...prev, emptyLine()])
    }

    const handleRemoveLine = (index: number) => {
        setLines((prev) => prev.filter((_, i) => i !== index))
    }

    const buildPayload = () => ({
        company_id: companyId,
        date,
        description: description || null,
        status: "draft" as const,
        lines: lines.map((l) => ({
            account_id: l.account_id,
            debit: l.debit || 0,
            credit: l.credit || 0,
        })),
    })

    const handleSaveDraft = async () => {
        if (!canSave) return

        if (mode === "create") {
            const { error } = await createEntry(buildPayload())
            if (error) {
                toast.error(error)
                return
            }
            toast.success("Entry saved as draft")
        } else if (existingEntry) {
            const { error } = await updateEntry(existingEntry.id, {
                date,
                description: description || null,
                lines: lines.map((l) => ({
                    account_id: l.account_id,
                    debit: l.debit || 0,
                    credit: l.credit || 0,
                })),
            })
            if (error) {
                toast.error(error)
                return
            }
            toast.success("Entry updated")
        }
        onSuccess()
    }

    const handleSaveAndPost = async () => {
        if (!canSave) return

        if (mode === "create") {
            const { error } = await createEntry({
                ...buildPayload(),
                status: "posted",
            })
            if (error) {
                toast.error(error)
                return
            }
            toast.success("Entry created and posted")
            onSuccess()
        } else if (existingEntry) {
            // First save changes, then post
            const { error: updateError } = await updateEntry(existingEntry.id, {
                date,
                description: description || null,
                lines: lines.map((l) => ({
                    account_id: l.account_id,
                    debit: l.debit || 0,
                    credit: l.credit || 0,
                })),
            })
            if (updateError) {
                toast.error(updateError)
                return
            }
            const { error: postError } = await postEntry(existingEntry.id)
            if (postError) {
                toast.error(postError)
                return
            }
            toast.success("Entry updated and posted")
            onSuccess()
        }
    }

    const isLoading = creating || updating || posting

    return (
        <div className="space-y-4">

            {/* Date + Description */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-zinc-300 text-xs">Date</Label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-zinc-300 text-xs">
                        Description
                        <span className="ml-1 text-zinc-600">(optional)</span>
                    </Label>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. June rent payment"
                        className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                    />
                </div>
            </div>

            {/* Lines */}
            <div className="space-y-2">
                <div className="grid grid-cols-[1fr_120px_120px_32px] gap-2 px-0.5">
                    <Label className="text-zinc-500 text-xs">Account</Label>
                    <Label className="text-zinc-500 text-xs text-right">Debit</Label>
                    <Label className="text-zinc-500 text-xs text-right">Credit</Label>
                    <span />
                </div>

                {lines.map((line, index) => (
                    <EntryLineRow
                        key={index}
                        line={line}
                        index={index}
                        accounts={activeAccounts}
                        onChange={handleLineChange}
                        onRemove={handleRemoveLine}
                        canRemove={lines.length > 2}
                    />
                ))}

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddLine}
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 text-xs gap-1.5 h-8"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add line
                </Button>
            </div>

            {/* Balance indicator */}
            <BalanceIndicator totalDebit={totalDebit} totalCredit={totalCredit} />

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-9 text-xs"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={!canSave || isLoading}
                    className="h-9 text-xs text-gray-400 bg-transparent border border-gray-700 hover:bg-green-950/30 hover:text-green-400"
                >
                    {isLoading ? "Saving..." : "Save as draft"}
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveAndPost}
                    disabled={!canSave || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs"
                >
                    {isLoading ? "Posting..." : "Save & post"}
                </Button>
            </div>

        </div>
    )
}