import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase.utils";
import { useAuthStore } from "@/modules/auth/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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

export default function SetPassword() {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [validSession, setValidSession] = useState(false);

    useEffect(() => {
        // Check if user has a valid invite session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setValidSession(true);
            } else {
                toast.error("Invalid or expired invite link");
                navigate("/login", { replace: true });
            }
        });
    }, [navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

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

        toast.success("Password set successfully. Welcome to LedgerIQ!");

        // Redirect based on role
        if (role === "super_admin") navigate("/dashboard", { replace: true });
        else navigate("/unauthorized", { replace: true });
    };

    if (!validSession) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold">
                        Welcome to LedgerIQ
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Set your password to activate your account
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
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
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Activating..." : "Activate account"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
