import { z } from "zod";

export const createFolderSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    name: z
        .string()
        .min(1, "Folder name is required")
        .max(100, "Folder name too long"),
});

export const updateFolderSchema = z.object({
    name: z
        .string()
        .min(1, "Folder name is required")
        .max(100, "Folder name too long"),
});

export const getFoldersSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
});

export const getFilesSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    folder_id: z.string().uuid().optional(),
});

export const uploadFileMetadataSchema = z.object({
    company_id: z.string().uuid("Invalid company ID"),
    folder_id: z.string().uuid().optional().or(z.literal("")),
    description: z.string().max(255).optional(),
});
