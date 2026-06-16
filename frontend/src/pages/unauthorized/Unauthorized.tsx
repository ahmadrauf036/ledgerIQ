import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowUpRight, LogOutIcon, UserLock } from "lucide-react";
import { useAuthStore } from "../../modules/auth/auth.store";
import { Spinner } from "../../components/ui/spinner";

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { signOut, loading } = useAuthStore();

    const handleLogout = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-accent-foreground px-4">
            <Button
                className="absolute right-5 top-5"
                variant="destructive"
                onClick={handleLogout}
            >
                {loading ? <Spinner /> : null}
                <LogOutIcon />
                Logout
            </Button>
            <div className="text-center max-w-md space-y-6">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-destructive/10 mx-auto">
                    <UserLock className="text-destructive/40" size={"38px"} />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-white">
                        Access denied
                    </h1>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        You do not have permission to view this page. Contact
                        your accountant if you think this is a mistake.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        className="outline-white bg-accent-foreground text-white py-4 px-2"
                        onClick={() => navigate(-1)}
                    >
                        Go back
                    </Button>
                    <Button
                        onClick={() =>
                            navigate("/dashboard", { replace: true })
                        }
                        className="bg-[#1D9E75] py-4 px-2"
                    >
                        Go to dashboard
                        <ArrowUpRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
