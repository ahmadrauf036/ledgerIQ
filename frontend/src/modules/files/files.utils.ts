export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function getFileIcon(mimeType: string): string {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
        return "excel";
    if (mimeType.includes("word")) return "word";
    if (mimeType === "text/csv") return "csv";
    return "file";
}

export function isPreviewable(mimeType: string): boolean {
    return mimeType === "application/pdf" || mimeType.startsWith("image/");
}
