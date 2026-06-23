import { create } from "zustand";
import { supabase } from "../../lib/supabase.utils";
import type { FileFolder, FileRecord } from "./files.types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = async () => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return {
        Authorization: `Bearer ${session?.access_token}`,
    };
};

const getJsonHeaders = async () => {
    const headers = await getHeaders();
    return { ...headers, "Content-Type": "application/json" };
};

interface FilesState {
    folders: FileFolder[];
    files: FileRecord[];
    loadingFolders: boolean;
    loadingFiles: boolean;
    creatingFolder: boolean;
    uploading: boolean;
    deleting: boolean;
    error: string | null;

    fetchFolders: (companyId: string) => Promise<void>;
    fetchFiles: (companyId: string, folderId?: string) => Promise<void>;
    createFolder: (
        companyId: string,
        name: string,
    ) => Promise<{ error: string | null }>;
    renameFolder: (
        folderId: string,
        name: string,
    ) => Promise<{ error: string | null }>;
    deleteFolder: (folderId: string) => Promise<{ error: string | null }>;
    uploadFile: (
        file: File,
        companyId: string,
        folderId: string | null,
        description?: string,
    ) => Promise<{ error: string | null }>;
    deleteFile: (fileId: string) => Promise<{ error: string | null }>;
    getPreviewUrl: (
        fileId: string,
    ) => Promise<{ url: string; file_type: string } | null>;
    getDownloadUrl: (fileId: string) => Promise<{ url: string } | null>;
}

export const useFilesStore = create<FilesState>((set) => ({
    folders: [],
    files: [],
    loadingFolders: false,
    loadingFiles: false,
    creatingFolder: false,
    uploading: false,
    deleting: false,
    error: null,

    fetchFolders: async (companyId) => {
        set({ loadingFolders: true, error: null });
        try {
            const headers = await getHeaders();
            const res = await fetch(
                `${API_URL}/files/folders?company_id=${companyId}`,
                { headers },
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ folders: json.data, loadingFolders: false });
        } catch (err) {
            set({ error: (err as Error).message, loadingFolders: false });
        }
    },

    fetchFiles: async (companyId, folderId) => {
        set({ loadingFiles: true, error: null });
        try {
            const headers = await getHeaders();
            const params = new URLSearchParams({ company_id: companyId });
            if (folderId) params.append("folder_id", folderId);

            const res = await fetch(`${API_URL}/files?${params}`, { headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set({ files: json.data, loadingFiles: false });
        } catch (err) {
            set({ error: (err as Error).message, loadingFiles: false });
        }
    },

    createFolder: async (companyId, name) => {
        set({ creatingFolder: true });
        try {
            const headers = await getJsonHeaders();
            const res = await fetch(`${API_URL}/files/folders`, {
                method: "POST",
                headers,
                body: JSON.stringify({ company_id: companyId, name }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                folders: [...state.folders, json.data],
                creatingFolder: false,
            }));
            return { error: null };
        } catch (err) {
            set({ creatingFolder: false });
            return { error: (err as Error).message };
        }
    },

    renameFolder: async (folderId, name) => {
        try {
            const headers = await getJsonHeaders();
            const res = await fetch(`${API_URL}/files/folders/${folderId}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ name }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                folders: state.folders.map((f) =>
                    f.id === folderId ? { ...f, ...json.data } : f,
                ),
            }));
            return { error: null };
        } catch (err) {
            return { error: (err as Error).message };
        }
    },

    deleteFolder: async (folderId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/files/folders/${folderId}`, {
                method: "DELETE",
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                folders: state.folders.filter((f) => f.id !== folderId),
            }));
            return { error: null };
        } catch (err) {
            return { error: (err as Error).message };
        }
    },

    uploadFile: async (file, companyId, folderId, description) => {
        set({ uploading: true });
        try {
            const headers = await getHeaders(); // no Content-Type — browser sets multipart boundary

            const formData = new FormData();
            formData.append("file", file);
            formData.append("company_id", companyId);
            if (folderId) formData.append("folder_id", folderId);
            if (description) formData.append("description", description);

            const res = await fetch(`${API_URL}/files/upload`, {
                method: "POST",
                headers,
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            set((state) => ({
                files: [json.data, ...state.files],
                folders: state.folders.map((f) =>
                    f.id === folderId
                        ? { ...f, file_count: f.file_count + 1 }
                        : f,
                ),
                uploading: false,
            }));
            return { error: null };
        } catch (err) {
            set({ uploading: false });
            return { error: (err as Error).message };
        }
    },

    deleteFile: async (fileId) => {
        set({ deleting: true });
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/files/${fileId}`, {
                method: "DELETE",
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            set((state) => ({
                files: state.files.filter((f) => f.id !== fileId),
                deleting: false,
            }));
            return { error: null };
        } catch (err) {
            set({ deleting: false });
            return { error: (err as Error).message };
        }
    },

    getPreviewUrl: async (fileId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/files/${fileId}/preview`, {
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            return { url: json.data.url, file_type: json.data.file_type };
        } catch {
            return null;
        }
    },

    getDownloadUrl: async (fileId) => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/files/${fileId}/download`, {
                headers,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            return { url: json.data.url };
        } catch {
            return null;
        }
    },
}));
