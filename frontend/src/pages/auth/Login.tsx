import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Spinner } from "../../components/ui/spinner";
import { useAuthStore } from "../../modules/auth/auth.store";
import type { LoginForm } from "../../modules/auth/login.schema";
import { BookText } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RoleRedirect } from "../../routes/roleRedirect";

export default function Login() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const signIn = useAuthStore((s) => s.signIn);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();
    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError(null);
        const { error } = await signIn(data.email, data.password);
        if (error) {
            toast.error(error || "Login failed");
            setError("Invalid email or password");
        } else {
            RoleRedirect();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-accent-foreground px-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Brand */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg border bg-background mx-auto">
                        <span className="text-xl">
                            <BookText color="#1D9E75" />
                        </span>
                    </div>
                    <h1 className="text-xl font-semibold text-white">
                        LedgerIQ
                    </h1>
                    <p className="text-sm text-gray-300">
                        Sign in to your account
                    </p>
                </div>

                {/* Card */}
                <Card className="bg-[#30302E] text-white">
                    <CardContent className="pt-6 space-y-4 ">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4 "
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`${errors.email ? "border-red-500" : ""}`}
                                    {...register("email", { required: true })}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="/forgot-password"
                                        className="text-xs hover:underline text-[#1D9E75]"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={`${errors.password ? "border-red-500" : ""}`}
                                    {...register("password", {
                                        required: true,
                                    })}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full mt-2 bg-[#1D9E75]"
                            >
                                {loading ? (
                                    <>
                                        <Spinner />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400">
                    Access is by invitation only. Contact your accountant for
                    access.
                </p>
            </div>
        </div>
    );
}
