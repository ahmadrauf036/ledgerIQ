import { useState } from "react";
import type { Client } from "../../modules/clients/clients.types";
import { Badge } from "../../components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
    MoreHorizontal,
    Eye,
    Pencil,
    PowerOff,
    Power,
    UserPlus,
} from "lucide-react";
import ClientDetailsModal from "./ClientDetailsModal";
import EditClientModal from "./EditClientModal";
import DeactivateClientDialog from "./DeactivateClientDialog";
import InviteUserModal from "./InviteUserModal";
import { Spinner } from "../ui/spinner";

interface Props {
    clients: Client[];
    loading: boolean;
}

export default function ClientsTable({ clients, loading }: Props) {
    const [detailsClient, setDetailsClient] = useState<Client | null>(null);
    const [editClient, setEditClient] = useState<Client | null>(null);
    const [deactivateClient, setDeactivateClient] = useState<Client | null>(
        null,
    );
    const [inviteClient, setInviteClient] = useState<Client | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
                <Spinner className="mr-1" />
                Loading clients...
            </div>
        );
    }

    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
                <p className="text-zinc-400 text-sm">No clients yet</p>
                <p className="text-zinc-600 text-xs">
                    Click "Add Client" to create your first client
                </p>
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Company</TableHead>
                        <TableHead className="text-zinc-400">Contact</TableHead>
                        <TableHead className="text-zinc-400">Email</TableHead>
                        <TableHead className="text-zinc-400">
                            Currency
                        </TableHead>
                        <TableHead className="text-zinc-400">NTN</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400 w-10"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow
                            key={client.id}
                            className="border-white/10 hover:bg-white/5"
                        >
                            <TableCell className="font-medium text-zinc-100">
                                {client.company_name}
                            </TableCell>
                            <TableCell className="text-zinc-300">
                                {client.full_name}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                                {client.email}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                                {client.currency}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                                {client.ntn_number ?? "—"}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        client.is_active
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }
                                >
                                    {client.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-zinc-800 border-white/10 text-zinc-100"
                                    >
                                        {/* View details */}
                                        <DropdownMenuItem
                                            className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                            onClick={() =>
                                                setDetailsClient(client)
                                            }
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View details
                                        </DropdownMenuItem>

                                        {/* Edit */}
                                        <DropdownMenuItem
                                            className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                            onClick={() =>
                                                setEditClient(client)
                                            }
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </DropdownMenuItem>

                                        {/* Invite user */}

                                        
                                            <DropdownMenuItem
                                                className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                                onClick={() =>
                                                    setInviteClient(client)
                                                }
                                            >
                                                <UserPlus className="h-3.5 w-3.5" />
                                                Invite user
                                            </DropdownMenuItem>
                                        

                                        <DropdownMenuSeparator className="bg-white/10" />

                                        {/* Deactivate / Activate */}
                                        <DropdownMenuItem
                                            className={`cursor-pointer gap-2 text-xs ${
                                                client.is_active
                                                    ? "focus:bg-red-500/10 text-red-400"
                                                    : "focus:bg-emerald-500/10 text-emerald-400"
                                            }`}
                                            onClick={() =>
                                                setDeactivateClient(client)
                                            }
                                        >
                                            {client.is_active ? (
                                                <>
                                                    <PowerOff className="h-3.5 w-3.5" />{" "}
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="h-3.5 w-3.5" />{" "}
                                                    Activate
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modals */}
            <ClientDetailsModal
                open={!!detailsClient}
                onClose={() => setDetailsClient(null)}
                client={detailsClient}
            />
            <EditClientModal
                open={!!editClient}
                onClose={() => setEditClient(null)}
                client={editClient}
            />
            <DeactivateClientDialog
                open={!!deactivateClient}
                onClose={() => setDeactivateClient(null)}
                client={deactivateClient}
            />
            <InviteUserModal
                open={!!inviteClient}
                onClose={() => setInviteClient(null)}
                client={inviteClient}
            />
        </>
    );
}
