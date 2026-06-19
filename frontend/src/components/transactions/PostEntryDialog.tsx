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

export default function PostEntryDialog({ open, onClose, entry, onSuccess }: Props) {
    const { postEntry, posting } = useTransactionsStore()

    const handleConfirm = async () => {
        if (!entry) return
        const { error } = await postEntry(entry.id)
        if (error) {
            toast.error(error)
            return
        }
        toast.success("Entry posted successfully")
        onSuccess()
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Post entry</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Once posted, <span className="text-zinc-300 font-mono">{entry?.entry_number}</span>{" "}
                        will affect account balances and reports. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 bg-accent-foreground">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={posting}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={posting}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {posting ? "Posting..." : "Yes, post entry"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}