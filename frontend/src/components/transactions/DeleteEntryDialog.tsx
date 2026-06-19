import { useTransactionsStore } from "../../modules/transactions/transactions.store"
import type { JournalEntry } from "../../modules/transactions/transactions.types"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog"
import { toast } from "sonner"

interface Props {
    open: boolean
    onClose: () => void
    entry: JournalEntry | null
    onSuccess: () => void
}

export default function DeleteEntryDialog({ open, onClose, entry, onSuccess }: Props) {
    const { deleteEntry, deleting } = useTransactionsStore()

    const handleConfirm = async () => {
        if (!entry) return
        const { error } = await deleteEntry(entry.id)
        if (error) {
            toast.error(error)
            return
        }
        toast.success("Entry deleted successfully")
        onSuccess()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Delete entry</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Are you sure you want to delete{" "}
                        <span className="text-zinc-300 font-mono">{entry?.entry_number}</span>?
                        This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 bg-accent-foreground">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={deleting}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={deleting}
                        variant="ghost"
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    >
                        {deleting ? "Deleting..." : "Yes, delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}