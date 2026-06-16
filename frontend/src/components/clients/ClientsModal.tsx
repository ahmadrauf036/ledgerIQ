import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createClientSchema,
    type CreateClientForm,
} from "../../modules/clients/clients.schema";
import { useClientsStore } from "../../modules/clients/clients.store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "../../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ClientModal({ open, onClose }: Props) {
    const { createClient, creating } = useClientsStore();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateClientForm>({
        resolver: zodResolver(createClientSchema),
        defaultValues: {
            currency: "PKR",
            financial_year_start: 1,
        },
    });

    const onSubmit = async (data: CreateClientForm) => {
        const { error } = await createClient(data);
        if (error) {
            toast.error(error);
            return;
        }
        toast.success(`Client created! Invite email sent to ${data.email}`);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg min-w-[60%] bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        Add new client
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Create a client account. An invite email will be sent to
                        set their password.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Row 1 — Company name + Full name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Company name
                            </Label>
                            <Input
                                {...register("company_name")}
                                placeholder="Acme Ltd"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                            {errors.company_name && (
                                <p className="text-xs text-red-400">
                                    {errors.company_name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Full name
                            </Label>
                            <Input
                                {...register("full_name")}
                                placeholder="Ali Khan"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                            {errors.full_name && (
                                <p className="text-xs text-red-400">
                                    {errors.full_name.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Row 2 — Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Email
                            </Label>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="ali@example.com"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Phone
                                <span className="ml-1 text-zinc-600">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                {...register("phone")}
                                placeholder="+92 300 0000000"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Row 3 — NTN + Address */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                NTN number
                                <span className="ml-1 text-zinc-600">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                {...register("ntn_number")}
                                placeholder="1234567-8"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Address
                                <span className="ml-1 text-zinc-600">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                {...register("address")}
                                placeholder="Lahore, Pakistan"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Row 4 — Financial year + Currency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Financial year start
                            </Label>
                            <Select
                                defaultValue="1"
                                onValueChange={(val) =>
                                    setValue(
                                        "financial_year_start",
                                        parseInt(val),
                                    )
                                }
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                                    {months.map((m) => (
                                        <SelectItem
                                            key={m.value}
                                            value={String(m.value)}
                                            className="text-zinc-100 focus:bg-zinc-700 text-sm"
                                        >
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Currency
                            </Label>
                            <Select
                                defaultValue="PKR"
                                onValueChange={(val) =>
                                    setValue("currency", val as "PKR" | "USD")
                                }
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                                    <SelectItem
                                        value="PKR"
                                        className="text-zinc-100 focus:bg-zinc-700 text-sm"
                                    >
                                        PKR — Pakistani Rupee
                                    </SelectItem>
                                    <SelectItem
                                        value="USD"
                                        className="text-zinc-100 focus:bg-zinc-700 text-sm"
                                    >
                                        USD — US Dollar
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-2 rounded-md bg-zinc-800 border border-white/5 px-3 py-2.5">
                        <Mail className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            An invite email will be sent to the client to set
                            their password and activate their account.
                        </p>
                    </div>

                    <DialogFooter className="pt-2 gap-2 bg-accent-foreground">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={creating}
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-9 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs"
                        >
                            {creating ? "Creating..." : "Create client"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
