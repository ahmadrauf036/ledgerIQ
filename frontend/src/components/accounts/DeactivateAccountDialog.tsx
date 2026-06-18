import { useAccountsStore } from "../../modules/accounts/accounts.store";
import type { Account } from "../../modules/accounts/accounts.types";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onClose: () => void;
    account: Account | null;
    onSuccess: () => void;
}

export default function DeactivateAccountDialog({
    open,
    onClose,
    account,
    onSuccess,
}: Props) {
    const { deactivateAccount, updating } = useAccountsStore();

    const handleConfirm = async () => {
        if (!account) return;

        const { error } = await deactivateAccount(account.id);

        if (error) {
            toast.error(error);
            return;
        }

        toast.success("Account deactivated successfully");
        onSuccess();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        Deactivate account
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Are you sure you want to deactivate{" "}
                        <span className="text-zinc-300 font-medium">
                            {account?.code} — {account?.name}
                        </span>
                        ? It will no longer be available for new transactions.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 bg-accent-foreground">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={updating}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={updating}
                        variant="ghost"
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    >
                        {updating ? "Please wait..." : "Yes, deactivate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
