import { FileBarChart } from "lucide-react";

export default function NoCompanySelected({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-lg border border-white/10 bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                <FileBarChart className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-400">{message}</p>
        </div>
    );
}
