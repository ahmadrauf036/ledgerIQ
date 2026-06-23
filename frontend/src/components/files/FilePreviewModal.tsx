import { useEffect, useState } from "react";
import { useFilesStore } from "../../modules/files/files.store";
import type { FileRecord } from "../../modules/files/files.types";
import { isPreviewable } from "../../modules/files/files.utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    file: FileRecord | null;
}

export default function FilePreviewModal({ open, onClose, file }: Props) {
    const { getPreviewUrl, getDownloadUrl } = useFilesStore();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && file) {
            setLoading(true);
            setPreviewUrl(null);
            getPreviewUrl(file.id).then((result) => {
                setPreviewUrl(result?.url ?? null);
                setLoading(false);
            });
        }
    }, [open, file, getPreviewUrl]);

    const handleDownload = async () => {
        if (!file) return;
        const result = await getDownloadUrl(file.id);
        if (result?.url) {
            window.open(result.url, "_blank");
        }
    };

    if (!file) return null;

    const canPreview = isPreviewable(file.file_type);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] bg-zinc-900 text-zinc-100 border border-white/10 flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-4 pt-4 pb-3 border-b border-white/10 flex-row items-center justify-between">
                    <DialogTitle className="text-sm font-medium text-zinc-100 truncate">
                        {file.file_name}
                    </DialogTitle>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownload}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 gap-1.5 text-xs shrink-0"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-zinc-950 flex items-center justify-center">
                    {loading ? (
                        <p className="text-sm text-zinc-500">
                            Loading preview...
                        </p>
                    ) : !canPreview ? (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-zinc-400">
                                Preview not available for this file type
                            </p>
                            <Button
                                size="sm"
                                onClick={handleDownload}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                Download to view
                            </Button>
                        </div>
                    ) : !previewUrl ? (
                        <p className="text-sm text-red-400">
                            Failed to load preview
                        </p>
                    ) : file.file_type === "application/pdf" ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            title={file.file_name}
                        />
                    ) : (
                        <img
                            src={previewUrl}
                            alt={file.file_name}
                            className="max-w-full max-h-full object-contain"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
