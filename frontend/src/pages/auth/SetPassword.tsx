import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { TriangleAlert } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const schema = z
    .object({
        full_name: z.string().min(1, "Full name is required"),
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

interface InviteData {
    company_name: string;
    email: string;
    role: string;
}

export default function SetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [inviteData, setInviteData] = useState<InviteData | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    // Validate token on page load
    useEffect(() => {
        if (!token) {
            setTokenError("Invalid invite link");
            setValidating(false);
            return;
        }

        const validate = async () => {
            try {
                const res = await fetch(`${API_URL}/invites/validate/${token}`);
                const json = await res.json();

                if (!res.ok) {
                    setTokenError(json.error ?? "Invalid invite link");
                    return;
                }

                setInviteData({
                    company_name: json.data.company_name,
                    email: json.data.email,
                    role: json.data.role,
                });
            } catch {
                setTokenError("Something went wrong. Please try again.");
            } finally {
                setValidating(false);
            }
        };

        validate();
    }, [token]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/invites/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password: data.password,
                    full_name: data.full_name,
                }),
            });
            const json = await res.json();

            if (!res.ok) {
                toast.error(json.error ?? "Something went wrong");
                return;
            }

            toast.success("Account activated! Please log in.");

            // Sign in automatically
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: inviteData!.email,
                    password: data.password,
                });

            if (signInError) {
                toast.error(
                    "Account activated but auto-login failed. Please log in manually.",
                );
                navigate("/login", { replace: true });
                return;
            }

            navigate("/", { replace: true }); 
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Button disabled className="text-md text-muted flex">
                    <Spinner className="h-6 w-6 mr-1"/>Validating invite link...
                </Button>
            </div>
        );
    }

    // Token error state
    if (tokenError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4 text-muted">
                <div className="w-full max-w-sm text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/30 mx-auto">
                        <span className="text-xl">
                            <TriangleAlert color="red" />
                        </span>
                    </div>
                    <h1 className="text-lg font-semibold">Invalid invite</h1>
                    <p className="text-sm text-muted/75">{tokenError}</p>
                    <Button
                        
                        className="w-full bg-[#10b981] hover:bg-[#10b981]/75"
                        onClick={() => navigate("/login")}
                    >
                        Go to login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-black">
            <div className="w-full max-w-sm space-y-6 text-muted">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold">
                        Welcome to LedgerIQ
                    </h1>
                    <p className="text-sm text-muted/65">
                        You have been invited to{" "}
                        <span className="font-medium text-muted">
                            {inviteData?.company_name}
                        </span>
                    </p>
                    <p className="text-xs text-muted/65">{inviteData?.email}</p>
                </div>

                <Card className="bg-accent-foreground text-muted">
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {/* Full name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="full_name">Full name</Label>
                                <Input
                                    id="full_name"
                                    placeholder="Ali Khan"
                                    {...register("full_name")}
                                />
                                {errors.full_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.full_name.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
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

                            {/* Confirm password */}
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
                                {loading ? <><Spinner className="mr-1"/>Activating...</> : "Activate account"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
