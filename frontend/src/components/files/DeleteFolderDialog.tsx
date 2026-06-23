import { useFilesStore } from "../../modules/files/files.store";
import type { FileFolder } from "../../modules/files/files.types";
import { Button } from "../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onClose: () => void;
    folder: FileFolder | null;
    onSuccess: () => void;
}

export default function DeleteFolderDialog({
    open,
    onClose,
    folder,
    onSuccess,
}: Props) {
    const { deleteFolder } = useFilesStore();

    const handleConfirm = async () => {
        if (!folder) return;
        const { error } = await deleteFolder(folder.id);
        if (error) {
            toast.error(error);
            return;
        }
        toast.success("Folder deleted successfully");
        onSuccess();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        Delete folder
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Are you sure you want to delete{" "}
                        <span className="text-zinc-300 font-medium">
                            {folder?.name}
                        </span>
                        ?
                        {folder && folder.file_count > 0 && (
                            <>
                                {" "}
                                This will permanently delete {
                                    folder.file_count
                                }{" "}
                                file(s) inside it.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 bg-accent-foreground">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="ghost"
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    >
                        Yes, delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
