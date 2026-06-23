import type { FileFolder } from "../../modules/files/files.types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Props {
    folders: FileFolder[];
    onOpen: (folder: FileFolder) => void;
    onRename: (folder: FileFolder) => void;
    onDelete: (folder: FileFolder) => void;
}

export default function FoldersGrid({
    folders,
    onOpen,
    onRename,
    onDelete,
}: Props) {
    if (folders.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {folders.map((folder) => (
                <div
                    key={folder.id}
                    onClick={() => onOpen(folder)}
                    className="group flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900 hover:bg-white/5 px-3 py-3 cursor-pointer transition-colors"
                >
                    <Folder className="h-5 w-5 text-amber-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-zinc-200 truncate">
                            {folder.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {folder.file_count} file
                            {folder.file_count !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-zinc-500 hover:text-zinc-100 hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-zinc-800 border-white/10 text-zinc-100"
                            >
                                <DropdownMenuItem
                                    className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                    onClick={() => onRename(folder)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="focus:bg-red-500/10 text-red-400 cursor-pointer gap-2 text-xs"
                                    onClick={() => onDelete(folder)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    );
}
