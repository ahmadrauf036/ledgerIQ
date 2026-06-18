import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createAccountSchema,
    type CreateAccountForm,
} from "../../modules/accounts/accounts.schema";
import { useAccountsStore } from "../../modules/accounts/accounts.store";
import type { Account } from "../../modules/accounts/accounts.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { toast } from "sonner";

const ACCOUNT_TYPES = [
    { value: "asset", label: "Asset" },
    { value: "liability", label: "Liability" },
    { value: "equity", label: "Equity" },
    { value: "revenue", label: "Revenue" },
    { value: "expense", label: "Expense" },
];

interface Props {
    open: boolean;
    onClose: () => void;
    companyId: string;
    mode: "create" | "edit";
    account?: Account | null;
    defaultParent?: Account | null;
    onSuccess: () => void;
}

export default function AccountModal({
    open,
    onClose,
    companyId,
    mode,
    account,
    defaultParent,
    onSuccess,
}: Props) {
    const { createAccount, updateAccount, creating, updating, flatAccounts } =
        useAccountsStore();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateAccountForm>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            type: "asset",
            parent_id: null,
        },
    });

    const selectedType = watch("type");

    // Populate form on open
    useEffect(() => {
        if (mode === "edit" && account) {
            reset({
                code: account.code,
                name: account.name,
                type: account.type,
                parent_id: account.parent_id,
                description: account.description ?? "",
            });
        } else if (mode === "create") {
            reset({
                code: "",
                name: "",
                type: defaultParent?.type ?? "asset",
                parent_id: defaultParent?.id ?? null,
                description: "",
            });
        }
    }, [mode, account, defaultParent, reset, open]);

    const onSubmit = async (data: CreateAccountForm) => {
        if (mode === "create") {
            const { error } = await createAccount({
                company_id: companyId,
                ...data,
            });
            if (error) {
                toast.error(error);
                return;
            }
            toast.success("Account created successfully");
        } else if (mode === "edit" && account) {
            const { error } = await updateAccount(account.id, data);
            if (error) {
                toast.error(error);
                return;
            }
            toast.success("Account updated successfully");
        }

        onSuccess();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Filter parent options — only same type, exclude self
    const parentOptions = flatAccounts.filter(
        (a) => a.type === selectedType && a.id !== account?.id,
    );

    const isLoading = creating || updating;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        {mode === "create" ? "Add account" : "Edit account"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {mode === "create"
                            ? "Create a new account in the chart of accounts"
                            : "Update account details"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Code + Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Account code
                            </Label>
                            <Input
                                {...register("code")}
                                placeholder="1115"
                                className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                            />
                            {errors.code && (
                                <p className="text-xs text-red-400">
                                    {errors.code.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-zinc-300 text-xs">
                                Account type
                            </Label>
                            <Select
                                value={selectedType}
                                onValueChange={(val) => {
                                    setValue("type", val as "asset" | "liability" | "equity" | "revenue" | "expense");
                                    setValue("parent_id", null); // reset parent when type changes
                                }}
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100">
                                    {ACCOUNT_TYPES.map((t) => (
                                        <SelectItem
                                            key={t.value}
                                            value={t.value}
                                            className="text-zinc-100 focus:bg-zinc-700 text-sm"
                                        >
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300 text-xs">
                            Account name
                        </Label>
                        <Input
                            {...register("name")}
                            placeholder="Petty Cash"
                            className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-400">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Parent account */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300 text-xs">
                            Parent account
                            <span className="ml-1 text-zinc-600">
                                (optional)
                            </span>
                        </Label>
                        <Select
                            value={watch("parent_id") ?? "none"}
                            onValueChange={(val) =>
                                setValue(
                                    "parent_id",
                                    val === "none" ? null : val,
                                )
                            }
                        >
                            <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm">
                                <SelectValue placeholder="None — top level" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100 max-h-64">
                                <SelectItem
                                    value="none"
                                    className="text-zinc-100 focus:bg-zinc-700 text-sm"
                                >
                                    None — top level
                                </SelectItem>
                                {parentOptions.map((p) => (
                                    <SelectItem
                                        key={p.id}
                                        value={p.id}
                                        className="text-zinc-100 focus:bg-zinc-700 text-sm"
                                    >
                                        {p.code} — {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-zinc-300 text-xs">
                            Description
                            <span className="ml-1 text-zinc-600">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            {...register("description")}
                            placeholder="Brief note about this account"
                            className="bg-zinc-800 border-white/10 text-zinc-100 placeholder:text-zinc-600 h-9 text-sm"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-2 bg-accent-foreground">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 h-9 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs"
                        >
                            {isLoading
                                ? "Saving..."
                                : mode === "create"
                                  ? "Create account"
                                  : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
