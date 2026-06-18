import { useEffect } from "react";
import { useClientsStore } from "../../modules/clients/clients.store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";

interface Props {
    value: string | null;
    onChange: (companyId: string) => void;
}

export default function CompanySwitcher({ value, onChange }: Props) {
    const { clients, fetchClients } = useClientsStore();

    useEffect(() => {
        if (clients.length === 0) fetchClients();
    }, [clients.length, fetchClients]);

    const activeClients = clients.filter((c) => c.is_active);

    return (
        <Select value={value ?? undefined} onValueChange={onChange}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 w-64 h-9 text-sm">
                <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                {activeClients.map((client) => (
                    <SelectItem
                        key={client.id}
                        value={client.id}
                        className="text-zinc-100 focus:bg-zinc-700 text-sm"
                    >
                        {client.company_name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
