import type { Client } from "../../modules/clients/clients.types"; 
import { Badge } from "../ui/badge"; 
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog"
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Calendar,
    Coins,
    Clock,
} from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    client: Client | null;
}

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | undefined | null;
}) {
    return (
        <div className="flex items-center gap-3 py-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span className="text-xs text-zinc-500 w-28 shrink-0">{label}</span>
            <span className="text-xs text-zinc-100 truncate">
                {value || <span className="text-zinc-600">—</span>}
            </span>
        </div>
    );
}

export default function ClientDetailsModal({ open, onClose, client }: Props) {
    if (!client) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md min-w-[60%] bg-zinc-900 text-zinc-100 border border-white/10 p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-4 pt-4 pb-3 border-b border-white/10">
                    <div className="flex items-center justify-between pr-7 gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 font-semibold text-xs">
                                {client.company_name?.[0]?.toUpperCase() ?? "C"}
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-semibold text-zinc-100 leading-none">
                                    {client.company_name}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                                    {client.email}
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={
                                client.is_active
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                                    : "bg-red-500/10 text-red-400 border-red-500/20 text-xs"
                            }
                        >
                            {client.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Body — two columns */}
                <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-0">
                    {/* Left column */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-1.5">
                            Company
                        </p>
                        <DetailRow
                            icon={Building2}
                            label="Name"
                            value={client.company_name}
                        />
                        <DetailRow
                            icon={FileText}
                            label="NTN"
                            value={client.ntn_number}
                        />
                        <DetailRow
                            icon={MapPin}
                            label="Address"
                            value={client.address}
                        />
                        <DetailRow
                            icon={Coins}
                            label="Currency"
                            value={client.currency}
                        />
                    </div>

                    {/* Right column */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600 mb-1.5">
                            Contact
                        </p>
                        <DetailRow
                            icon={User}
                            label="Full name"
                            value={client.full_name}
                        />
                        <DetailRow
                            icon={Mail}
                            label="Email"
                            value={client.email}
                        />
                        <DetailRow
                            icon={Phone}
                            label="Phone"
                            value={client.phone}
                        />
                        <DetailRow
                            icon={Calendar}
                            label="FY start"
                            value={
                                months[(client.financial_year_start ?? 1) - 1]
                            }
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-white/10 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="text-xs text-zinc-600">
                        Client since{" "}
                        {client.created_at
                            ? new Date(client.created_at).toLocaleDateString(
                                  "en-PK",
                                  {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                  },
                              )
                            : "—"}
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
