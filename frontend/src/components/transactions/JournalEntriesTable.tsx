import type { JournalEntry } from "../../modules/transactions/transactions.types"
import EntryStatusBadge from "./EntryStatusBadge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { MoreHorizontal, Eye, Pencil, Send, Trash2 } from "lucide-react"

interface Props {
    entries: JournalEntry[]
    loading: boolean
    onView: (entry: JournalEntry) => void
    onEdit: (entry: JournalEntry) => void
    onPost: (entry: JournalEntry) => void
    onDelete: (entry: JournalEntry) => void
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export default function JournalEntriesTable({
    entries,
    loading,
    onView,
    onEdit,
    onPost,
    onDelete,
}: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                Loading entries...
            </div>
        )
    }

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
                <p className="text-zinc-400 text-sm">No journal entries yet</p>
                <p className="text-zinc-600 text-xs">
                    Click "New entry" to record your first transaction
                </p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Entry #</TableHead>
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400">Description</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400 w-10"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((entry) => (
                    <TableRow
                        key={entry.id}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => onView(entry)}
                    >
                        <TableCell className="font-mono text-xs text-zinc-300">
                            {entry.entry_number}
                        </TableCell>
                        <TableCell className="text-zinc-300 text-sm">
                            {formatDate(entry.date)}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                            {entry.description ?? "—"}
                        </TableCell>
                        <TableCell>
                            <EntryStatusBadge status={entry.status} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-zinc-800 border-white/10 text-zinc-100"
                                >
                                    <DropdownMenuItem
                                        className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                        onClick={() => onView(entry)}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View details
                                    </DropdownMenuItem>
                                    {entry.status === "draft" && (
                                        <>
                                            <DropdownMenuItem
                                                className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                                onClick={() => onEdit(entry)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="focus:bg-emerald-500/10 text-emerald-400 cursor-pointer gap-2 text-xs"
                                                onClick={() => onPost(entry)}
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                                Post entry
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="focus:bg-red-500/10 text-red-400 cursor-pointer gap-2 text-xs"
                                                onClick={() => onDelete(entry)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}