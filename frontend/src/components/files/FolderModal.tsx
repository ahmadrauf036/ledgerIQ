import { useEffect, useState } from "react";
import { useFilesStore } from "../../modules/files/files.store";
import type { FileFolder } from "../../modules/files/files.types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onClose: () => void;
    companyId: string;
    mode: "create" | "rename";
    folder?: FileFolder | null;
    onSuccess: () => void;
}

export default function FolderModal({
    open,
    onClose,
    companyId,
    mode,
    folder,
    onSuccess,
}: Props) {
    const { createFolder, renameFolder, creatingFolder } = useFilesStore();
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) setName(mode === "rename" ? (folder?.name ?? "") : "");
    }, [open, mode, folder]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Folder name is required");
            return;
        }

        const { error } =
            mode === "create"
                ? await createFolder(companyId, name.trim())
                : await renameFolder(folder!.id, name.trim());

        if (error) {
            toast.error(error);
            return;
        }

        toast.success(mode === "create" ? "Folder created" : "Folder renamed");
        onSuccess();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        {mode === "create" ? "New folder" : "Rename folder"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-1.5">
                    <Label className="text-zinc-300 text-xs">Folder name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. 2026 Bank Statements"
                        className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                </div>

                <DialogFooter className="gap-2 pt-2 bg-accent-foreground">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={creatingFolder}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-9 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={creatingFolder}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs"
                    >
                        {creatingFolder
                            ? "Saving..."
                            : mode === "create"
                              ? "Create"
                              : "Rename"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
