import multer from "multer";
import { MAX_FILE_SIZE } from "./files.types";

// Store in memory — we upload buffer directly to Supabase, no disk needed
export const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});
