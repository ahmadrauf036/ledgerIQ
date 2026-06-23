import { useState, useRef } from "react";
import { useFilesStore } from "../../modules/files/files.store";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../../modules/files/files.types";
import { formatFileSize } from "../../modules/files/files.utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../components/ui/dialog";
import { Upload, X, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onClose: () => void;
    companyId: string;
    folderId: string | null;
    onSuccess: () => void;
}

export default function UploadFileModal({
    open,
    onClose,
    companyId,
    folderId,
    onSuccess,
}: Props) {
    const { uploadFile, uploading } = useFilesStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (file: File) => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error(
                "File type not allowed. Use PDF, JPG, PNG, XLSX, XLS, DOCX, DOC, or CSV",
            );
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            );
            return;
        }
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const { error } = await uploadFile(
            selectedFile,
            companyId,
            folderId,
            description || undefined,
        );

        if (error) {
            toast.error(error);
            return;
        }

        toast.success("File uploaded successfully");
        handleClose();
        onSuccess();
    };

    const handleClose = () => {
        setSelectedFile(null);
        setDescription("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        Upload file
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        PDF, JPG, PNG, XLSX, XLS, DOCX, DOC, or CSV — max 20MB
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drop zone */}
                    {!selectedFile ? (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={`
                                flex flex-col items-center justify-center gap-2
                                border-2 border-dashed rounded-lg py-10 px-4
                                cursor-pointer transition-colors
                                ${
                                    isDragging
                                        ? "border-emerald-500 bg-emerald-500/5"
                                        : "border-white/10 hover:border-white/20 bg-zinc-800/50"
                                }
                            `}
                        >
                            <Upload className="h-6 w-6 text-zinc-500" />
                            <p className="text-sm text-zinc-400">
                                Drag and drop or{" "}
                                <span className="text-emerald-400">browse</span>
                            </p>
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept={ALLOWED_FILE_TYPES.join(",")}
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2.5">
                            <FileIcon className="h-4 w-4 text-zinc-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-zinc-200 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedFile(null)}
                                className="h-6 w-6 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300 text-xs">
                            Description
                            <span className="ml-1 text-zinc-600">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. June bank statement"
                            className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-2 bg-accent-foreground">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={uploading}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-9 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs"
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
