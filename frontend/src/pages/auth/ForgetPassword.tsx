import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Spinner } from "../../components/ui/spinner";

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
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: data.email }),
                },
            );
            const json = await res.json();

            if (!res.ok) {
                toast.error(json.error ?? "Something went wrong");
                setLoading(false);
                return;
            }

            setSent(true);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white px-4 bg-black">
                <div className="w-full max-w-sm space-y-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-foreground mx-auto">
                        <span className="text-2xl">
                            <MailCheck color="#10b981" />
                        </span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold">
                            Check your email
                        </h1>
                        <p className="text-sm text-muted/75">
                            We sent a password reset link to your email address.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full bg-black"
                        onClick={() => navigate("/login")}
                    >
                        Back to login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-semibold">Forgot password</h1>
                    <p className="text-sm text-muted/75">
                        Enter your email and we will send you a reset link
                    </p>
                </div>

                <Card className="bg-accent-foreground">
                    <CardContent className="pt-6 bg-accent-foreground text-white">
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
                                className="w-full bg-[#10b981]"
                                disabled={loading}
                                variant={"ghost"}
                            >
                                {loading ? <><Spinner/>Sending...</> : "Send reset link"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-1 text-xs text-muted/75 hover:text-foreground mx-auto bg-black"
                    size={"xs"}
                    variant={"outline"}
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                </Button>
            </div>
        </div>
    );
}
