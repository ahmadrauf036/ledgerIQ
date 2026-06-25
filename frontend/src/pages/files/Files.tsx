import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useFilesStore } from "../../modules/files/files.store";
import type { FileFolder, FileRecord } from "../../modules/files/files.types";
import CompanySwitcher from "../../components/accounts/CompanySwitcher";
import FoldersGrid from "../../components/files/FoldersGrid";
import FilesTable from "../../components/files/FilesTable";
import UploadFileModal from "../../components/files/UploadFileModal";
import FolderModal from "../../components/files/FolderModal";
import DeleteFolderDialog from "../../components/files/DeleteFolderDialog";
import DeleteFileDialog from "../../components/files/DeleteFileDialog";
import FilePreviewModal from "../../components/files/FilePreviewModal";
import { Button } from "../../components/ui/button";
import { Plus, FolderPlus, ChevronRight, FolderOpen } from "lucide-react";
interface Props {
    hideCompanySwitcher?: boolean;
}
export default function FilesPage({ hideCompanySwitcher = false }: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const companyId = searchParams.get("company");
    const folderId = searchParams.get("folder");

    const {
        folders,
        files,

        loadingFiles,
        fetchFolders,
        fetchFiles,
    } = useFilesStore();

    const [uploadOpen, setUploadOpen] = useState(false);
    const [folderModalOpen, setFolderModalOpen] = useState(false);
    const [folderModalMode, setFolderModalMode] = useState<"create" | "rename">(
        "create",
    );
    const [activeFolder, setActiveFolder] = useState<FileFolder | null>(null);
    const [deleteFolderTarget, setDeleteFolderTarget] =
        useState<FileFolder | null>(null);
    const [deleteFileTarget, setDeleteFileTarget] = useState<FileRecord | null>(
        null,
    );
    const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);

    const currentFolder = folders.find((f) => f.id === folderId) ?? null;

    useEffect(() => {
        if (companyId) {
            fetchFolders(companyId);
            fetchFiles(companyId, folderId ?? undefined);
        }
    }, [companyId, folderId, fetchFiles, fetchFolders]);

    const handleCompanyChange = (id: string) => {
        setSearchParams({ company: id });
    };

    const handleOpenFolder = (folder: FileFolder) => {
        setSearchParams({ company: companyId!, folder: folder.id });
    };

    const handleBackToRoot = () => {
        setSearchParams({ company: companyId! });
    };

    const refetch = () => {
        if (companyId) {
            fetchFolders(companyId);
            fetchFiles(companyId, folderId ?? undefined);
        }
    };

    const handleDownload = async (file: FileRecord) => {
        const { getDownloadUrl } = useFilesStore.getState();
        const result = await getDownloadUrl(file.id);
        if (result?.url) window.open(result.url, "_blank");
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        Files
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Share documents with your clients
                    </p>
                </div>
                {companyId && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFolderModalMode("create");
                                setFolderModalOpen(true);
                            }}
                            className="dark border-white/10 bg-accent-foreground text-accent hover:bg-gray-300 hover:text-accent gap-2 h-9 text-xs"
                        >
                            <FolderPlus className="h-3.5 w-3.5" />
                            New folder
                        </Button>
                        <Button
                            onClick={() => setUploadOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-9 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Upload file
                        </Button>
                    </div>
                )}
            </div>

            {/* Company switcher */}
            {!hideCompanySwitcher && (
                <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">Client:</span>
                    <CompanySwitcher
                        value={companyId}
                        onChange={handleCompanyChange}
                    />
                </div>
            )}

            {!companyId ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-lg border border-white/10 bg-zinc-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                        <FolderOpen className="h-5 w-5 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400">
                        Select a client to view their files
                    </p>
                </div>
            ) : (
                <>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-sm">
                        <button
                            onClick={handleBackToRoot}
                            className={`${
                                !currentFolder
                                    ? "text-zinc-100 font-medium"
                                    : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            Files
                        </button>
                        {currentFolder && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                                <span className="text-zinc-100 font-medium">
                                    {currentFolder.name}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Folders grid — only show at root */}
                    {!currentFolder && (
                        <FoldersGrid
                            folders={folders}
                            onOpen={handleOpenFolder}
                            onRename={(folder) => {
                                setActiveFolder(folder);
                                setFolderModalMode("rename");
                                setFolderModalOpen(true);
                            }}
                            onDelete={setDeleteFolderTarget}
                        />
                    )}

                    {/* Files table */}
                    <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                        <FilesTable
                            files={files}
                            loading={loadingFiles}
                            onPreview={setPreviewFile}
                            onDownload={handleDownload}
                            onDelete={setDeleteFileTarget}
                        />
                    </div>
                </>
            )}

            {/* Modals */}
            {companyId && (
                <>
                    <UploadFileModal
                        open={uploadOpen}
                        onClose={() => setUploadOpen(false)}
                        companyId={companyId}
                        folderId={folderId ?? null}
                        onSuccess={refetch}
                    />
                    <FolderModal
                        open={folderModalOpen}
                        onClose={() => {
                            setFolderModalOpen(false);
                            setActiveFolder(null);
                        }}
                        companyId={companyId}
                        mode={folderModalMode}
                        folder={activeFolder}
                        onSuccess={refetch}
                    />
                    <DeleteFolderDialog
                        open={!!deleteFolderTarget}
                        onClose={() => setDeleteFolderTarget(null)}
                        folder={deleteFolderTarget}
                        onSuccess={refetch}
                    />
                    <DeleteFileDialog
                        open={!!deleteFileTarget}
                        onClose={() => setDeleteFileTarget(null)}
                        file={deleteFileTarget}
                        onSuccess={refetch}
                    />
                    <FilePreviewModal
                        open={!!previewFile}
                        onClose={() => setPreviewFile(null)}
                        file={previewFile}
                    />
                </>
            )}
        </div>
    );
}
