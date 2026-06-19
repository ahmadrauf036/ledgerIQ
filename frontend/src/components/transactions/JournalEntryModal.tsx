import { useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog"
import { useTransactionsStore } from "../../modules/transactions/transactions.store"
import JournalEntryForm from "./JournalEntryForm"

interface Props {
    open: boolean
    onClose: () => void
    companyId: string
    mode: "create" | "edit"
    entryId?: string | null
    onSuccess: () => void
}

export default function JournalEntryModal({
    open,
    onClose,
    companyId,
    mode,
    entryId,
    onSuccess,
}: Props) {
    const { currentEntry, fetchEntryById, clearCurrentEntry, loadingEntry } =
        useTransactionsStore()

    useEffect(() => {
        if (open && mode === "edit" && entryId) {
            fetchEntryById(entryId)
        }
        if (!open) {
            clearCurrentEntry()
        }
    }, [open, entryId, mode])

    const handleSuccess = () => {
        onSuccess()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className=" min-w-fit bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        {mode === "create" ? "New journal entry" : "Edit journal entry"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {mode === "create"
                            ? "Record a new transaction with at least 2 balanced lines"
                            : "Update this draft entry"}
                    </DialogDescription>
                </DialogHeader>

                {mode === "edit" && loadingEntry ? (
                    <div className="py-8 text-center text-sm text-zinc-500">
                        Loading entry...
                    </div>
                ) : (
                    <JournalEntryForm
                        companyId={companyId}
                        mode={mode}
                        existingEntry={mode === "edit" ? currentEntry : null}
                        onSuccess={handleSuccess}
                        onCancel={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}