import { useEffect, useState } from "react";
import { useClientsStore } from "@/modules/clients/clients.store";
import ClientsTable from "@/components/clients/ClientsTable";
import CreateClientModal from "@/components/clients/ClientsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";

export default function ClientsPage() {
    const { clients, loading, fetchClients } = useClientsStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filtered = clients.filter(
        (c) =>
            c.company_name.toLowerCase().includes(search.toLowerCase()) ||
            c.full_name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        Clients
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Manage your client companies
                    </p>
                </div>
                <Button
                    onClick={() => setModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Add Client
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                />
            </div>

            {/* Table */}
            <div className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                <ClientsTable clients={filtered} loading={loading} />
            </div>

            {/* Modal */}
            <CreateClientModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
}
