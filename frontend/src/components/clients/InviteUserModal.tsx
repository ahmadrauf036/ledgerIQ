import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    inviteUserSchema,
    type InviteUserForm,
} from "../../modules/clients/clients.schema";
import { useClientsStore } from "../../modules/clients/clients.store";
import type { Client } from "../../modules/clients/clients.types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { Mail, ShieldCheck, BookOpen, TriangleAlert } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    client: Client | null;
}

export default function InviteUserModal({ open, onClose, client }: Props) {
    const { inviteUser, inviting } = useClientsStore();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
    } = useForm<InviteUserForm>({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: {
            role: "client_owner",
        },
    });

    const onSubmit = async (data: InviteUserForm) => {
        if (!client) return;

        const { error } = await inviteUser(data.email, data.role, client.id);

        if (error) {
            toast.error(error);
            return;
        }

        toast.success(`Invite sent to ${data.email}`);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                            <Mail className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-semibold text-zinc-100">
                                Invite user
                            </DialogTitle>
                            <DialogDescription className="text-xs text-zinc-500">
                                {client?.company_name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300 text-xs">
                            Email address
                        </Label>
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="user@example.com"
                            className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-400">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    {client?.email &&
                        watch("email") === client.email &&
                        client.invite_status === "accepted" && (
                            <p className="text-xs text-amber-400 flex items-start gap-1">
                                <TriangleAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                This email already has an active account. Use a
                                different email to invite a bookkeeper.
                            </p>
                        )}
                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300 text-xs">Role</Label>
                        <Select
                            defaultValue="client_owner"
                            onValueChange={(val) =>
                                setValue(
                                    "role",
                                    val as "client_owner" | "bookkeeper",
                                )
                            }
                        >
                            <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                                <SelectItem
                                    value="client_owner"
                                    className="text-zinc-100 focus:bg-gray-300 "
                                >
                                    <div className="flex items-center gap-2 py-0.5">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium">
                                                Client owner
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                Can view their company data
                                            </p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem
                                    value="bookkeeper"
                                    className="text-zinc-100 focus:bg-gray-300"
                                >
                                    <div className="flex items-center gap-2 py-0.5">
                                        <BookOpen className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium">
                                                Bookkeeper
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                Can enter and manage
                                                transactions
                                            </p>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-xs text-red-400">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-2 rounded-md bg-zinc-800 border border-white/5 px-3 py-2.5">
                        <Mail className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            An invite email will be sent with a link to set
                            their password and activate their account.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 pt-1 bg-accent-foreground">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={inviting}
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={inviting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs"
                        >
                            {inviting ? "Sending..." : "Send invite"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
