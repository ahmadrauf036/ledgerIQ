import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase.utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
    email: z.string().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(
            data.email,
            { redirectTo: `${window.location.origin}/reset-password` },
        );
        setLoading(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        setSent(true);
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
                <div className="w-full max-w-sm space-y-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mx-auto">
                        <span className="text-2xl">✉️</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold">
                            Check your email
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            We sent a password reset link to your email address.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/login")}
                    >
                        Back to login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold">Forgot password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and we will send you a reset link
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send reset link"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                </button>
            </div>
        </div>
    );
}
