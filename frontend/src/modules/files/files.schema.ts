import { z } from "zod";

export const createFolderSchema = z.object({
    name: z
        .string()
        .min(1, "Folder name is required")
        .max(100, "Folder name too long"),
});

export type CreateFolderForm = z.infer<typeof createFolderSchema>;
