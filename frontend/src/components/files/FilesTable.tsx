import type { FileRecord } from "../../modules/files/files.types";
import { formatFileSize, formatDate } from "../../modules/files/files.utils";
import FileTypeIcon from "./FileTypeIcon";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { MoreHorizontal, Eye, Download, Trash2 } from "lucide-react";

interface Props {
    files: FileRecord[];
    loading: boolean;
    onPreview: (file: FileRecord) => void;
    onDownload: (file: FileRecord) => void;
    onDelete: (file: FileRecord) => void;
}

export default function FilesTable({
    files,
    loading,
    onPreview,
    onDownload,
    onDelete,
}: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-zinc-500 text-sm">
                Loading files...
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-zinc-400 text-sm">No files here yet</p>
                <p className="text-zinc-600 text-xs">
                    Upload a file to get started
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Name</TableHead>
                    <TableHead className="text-zinc-400">Uploaded by</TableHead>
                    <TableHead className="text-zinc-400">Size</TableHead>
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400 w-10"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.map((file) => (
                    <TableRow
                        key={file.id}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => onPreview(file)}
                    >
                        <TableCell>
                            <div className="flex items-center gap-2.5">
                                <FileTypeIcon mimeType={file.file_type} />
                                <div className="min-w-0">
                                    <p className="text-sm text-zinc-200 truncate max-w-65">
                                        {file.file_name}
                                    </p>
                                    {file.description && (
                                        <p className="text-xs text-zinc-500 truncate max-w-65">
                                            {file.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                            {file.uploader_full_name ||
                                file.uploader_email ||
                                "—"}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                            {formatFileSize(file.file_size)}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                            {formatDate(file.created_at)}
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
                                        onClick={() => onPreview(file)}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                        onClick={() => onDownload(file)}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-red-500/10 text-red-400 cursor-pointer gap-2 text-xs"
                                        onClick={() => onDelete(file)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
