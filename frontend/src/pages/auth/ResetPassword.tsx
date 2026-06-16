import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../lib/supabase.utils"; 
import { Button } from "../../components/ui/button"; 
import { Input } from "../../components/ui/input"; 
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { Spinner } from "../../components/ui/spinner";

const schema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [validSession, setValidSession] = useState(false);
    const [checking, setChecking] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        // Supabase puts the recovery token in the URL hash
        // onAuthStateChange fires with SIGNED_IN event on recovery
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setValidSession(true);
                setChecking(false);
            }
        });

        // Fallback — check existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setValidSession(true);
            }
            setChecking(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: data.password,
        });
        setLoading(false);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success("Password updated successfully");
        navigate("/login", { replace: true });
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40">
                <p className="text-sm text-muted-foreground">
                    Verifying reset link...
                </p>
            </div>
        );
    }

    if (!validSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
                <div className="w-full max-w-sm text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto">
                        <span className="text-xl">⚠️</span>
                    </div>
                    <h1 className="text-lg font-semibold">
                        Invalid reset link
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This link is invalid or has expired. Please request a
                        new one.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/forgot-password")}
                    >
                        Request new link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center text-muted px-4 bg-black">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold ">Set new password</h1>
                    <p className="text-sm text-muted/75">
                        Choose a strong password for your account
                    </p>
                </div>

                <Card className="bg-accent-foreground text-muted">
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword">
                                    Confirm password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#10b981] hover:bg-[#10b981]/70"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner />
                                        Updating...
                                    </>
                                ) : (
                                    "Update password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
