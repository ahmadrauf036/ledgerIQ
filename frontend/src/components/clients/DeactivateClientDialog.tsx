import { useClientsStore } from "../../modules/clients/clients.store";
import type { Client } from "../../modules/clients/clients.types";
import { Button } from "../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "../../components/ui/dialog";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onClose: () => void;
    client: Client | null;
}

export default function DeactivateClientDialog({
    open,
    onClose,
    client,
}: Props) {
    const { deactivateClient, activateClient, updating } = useClientsStore();

    const isActive = client?.is_active ?? true;

    const handleConfirm = async () => {
        if (!client) return;

        const { error } = isActive
            ? await deactivateClient(client.id)
            : await activateClient(client.id);

        if (error) {
            toast.error(error);
            return;
        }

        toast.success(
            isActive
                ? "Client deactivated successfully"
                : "Client activated successfully",
        );
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-zinc-900 text-zinc-100 border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        {isActive ? "Deactivate client" : "Activate client"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {isActive
                            ? `Are you sure you want to deactivate ${client?.company_name}? They will lose access to the platform.`
                            : `Are you sure you want to activate ${client?.company_name}? They will regain access to the platform.`}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={updating}
                        className={
                            isActive
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }
                        variant="ghost"
                    >
                        {updating
                            ? "Please wait..."
                            : isActive
                              ? "Yes, deactivate"
                              : "Yes, activate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
