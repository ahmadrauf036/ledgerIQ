import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createClientSchema,
    type CreateClientForm,
} from "@/modules/clients/clients.schema";
import { useClientsStore } from "@/modules/clients/clients.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

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

export default function CreateClientModal({ open, onClose }: Props) {
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
        toast.success("Client created successfully");
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-7xl min-w-[60%] bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        Add New Client
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Create a client account. They will receive an invite
                        email to set their password.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-2"
                >
                    {/* Row 1 — Company name + Full name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">
                                Company name
                            </Label>
                            <Input
                                {...register("company_name")}
                                placeholder="Acme Ltd"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                            />
                            {errors.company_name && (
                                <p className="text-xs text-red-400">
                                    {errors.company_name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">Full name</Label>
                            <Input
                                {...register("full_name")}
                                placeholder="Ali Khan"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
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
                            <Label className="text-zinc-300">Email</Label>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="ali@example.com"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-400">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
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
                    </div>

                    {/* Row 3 — NTN + Address */}
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    {/* Row 4 — Financial year + Currency */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300">
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
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100">
                                    <SelectValue placeholder="Select month" />
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
                                defaultValue="PKR"
                                onValueChange={(val) =>
                                    setValue("currency", val as "PKR" | "USD")
                                }
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100">
                                    <SelectValue placeholder="Select currency" />
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
                            onClick={handleClose}
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {creating ? <><Spinner/> Creating...</> : "Create client"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
