import type { Client } from "@/modules/clients/clients.types";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface Props {
    clients: Client[];
    loading: boolean;
}

export default function ClientsTable({ clients, loading }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 space-x-2 text-zinc-500 text-sm">
                <div className="flex w-fit max-w-xs flex-col gap-4 [--radius:1rem]">
                    <Button disabled variant={"secondary"} size="sm">
                        <Spinner data-icon="inline-start" />
                        Loading...
                    </Button>
                </div>
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
        <Table>
            <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Company</TableHead>
                    <TableHead className="text-zinc-400">Full Name</TableHead>
                    <TableHead className="text-zinc-400">Email</TableHead>
                    <TableHead className="text-zinc-400">Currency</TableHead>
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
                        <TableCell>
                            <Badge
                                className={
                                    client.is_active
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                }
                                variant="outline"
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
                                    <DropdownMenuItem className="focus:bg-zinc-700 cursor-pointer">
                                        View details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-zinc-700 cursor-pointer">
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-red-500/10 text-red-400 cursor-pointer">
                                        {client.is_active
                                            ? "Deactivate"
                                            : "Activate"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
