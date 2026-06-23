import { FileText, Image, FileSpreadsheet, File } from "lucide-react";
import { getFileIcon } from "../../modules/files/files.utils";

export default function FileTypeIcon({ mimeType }: { mimeType: string }) {
    const type = getFileIcon(mimeType);

    const config = {
        pdf: { icon: FileText, className: "text-red-400" },
        image: { icon: Image, className: "text-blue-400" },
        excel: { icon: FileSpreadsheet, className: "text-emerald-400" },
        word: { icon: FileText, className: "text-blue-500" },
        csv: { icon: FileSpreadsheet, className: "text-amber-400" },
        file: { icon: File, className: "text-zinc-500" },
    }[type];

    const Icon = config?.icon;

    return Icon && <Icon className={`h-4 w-4 ${config?.className}`} />;
}
