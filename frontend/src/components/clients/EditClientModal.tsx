import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
    company_name: z.string().min(1, "Company name is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
    ntn_number: z.string().optional(),
    financial_year_start: z.number().min(1).max(12),
    currency: z.enum(["PKR", "USD"]),
});

type FormData = z.infer<typeof schema>;

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
    client: Client | null;
}

export default function EditClientModal({ open, onClose, client }: Props) {
    const { updateClient, updating } = useClientsStore();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    // Populate form when client changes
    useEffect(() => {
        if (client) {
            reset({
                company_name: client.company_name,
                phone: client.phone ?? "",
                address: client.address ?? "",
                ntn_number: client.ntn_number ?? "",
                financial_year_start: client.financial_year_start,
                currency: client.currency,
            });
        }
    }, [client, reset]);

    const onSubmit = async (data: FormData) => {
        if (!client) return;
        const { error } = await updateClient(client.id, data);
        if (error) {
            toast.error(error);
            return;
        }
        toast.success("Client updated successfully");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        Edit Client
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Update client company details
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Company name */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300">Company name</Label>
                        <Input
                            {...register("company_name")}
                            className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                        />
                        {errors.company_name && (
                            <p className="text-xs text-red-400">
                                {errors.company_name.message}
                            </p>
                        )}
                    </div>

                    {/* Phone + NTN */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">
                                Phone
                                <span className="ml-1 text-zinc-600">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                {...register("phone")}
                                placeholder="+92 300 0000000"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">
                                NTN number
                                <span className="ml-1 text-zinc-600">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                {...register("ntn_number")}
                                placeholder="1234567-8"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300">
                            Address
                            <span className="ml-1 text-zinc-600">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            {...register("address")}
                            placeholder="Lahore, Pakistan"
                            className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                        />
                    </div>

                    {/* Financial year + Currency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">
                                Financial year start
                            </Label>
                            <Select
                                value={String(
                                    client?.financial_year_start ?? 1,
                                )}
                                onValueChange={(val) =>
                                    setValue(
                                        "financial_year_start",
                                        parseInt(val),
                                    )
                                }
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                                    {months.map((m) => (
                                        <SelectItem
                                            key={m.value}
                                            value={String(m.value)}
                                            className="text-zinc-100 focus:bg-zinc-700"
                                        >
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">Currency</Label>
                            <Select
                                value={client?.currency ?? "PKR"}
                                onValueChange={(val) =>
                                    setValue("currency", val as "PKR" | "USD")
                                }
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                                    <SelectItem
                                        value="PKR"
                                        className="text-zinc-100 focus:bg-zinc-700"
                                    >
                                        PKR — Pakistani Rupee
                                    </SelectItem>
                                    <SelectItem
                                        value="USD"
                                        className="text-zinc-100 focus:bg-zinc-700"
                                    >
                                        USD — US Dollar
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 gap-2 bg-accent-foreground">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updating}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {updating ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
