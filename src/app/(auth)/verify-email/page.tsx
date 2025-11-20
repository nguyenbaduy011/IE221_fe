/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/authApi";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pending_email");
    if (!pendingEmail) {
      toast.error("No account found to verify.");
      router.push("/login");
    } else {
      setEmail(pendingEmail);
    }
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setIsResending(true);

    try {
      await authApi.resendActivation(email);
      toast.success(`Verification email sent to ${email}`);
      setCountdown(300);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend email. Try again later."
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-lg shadow p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>

        <p className="text-muted-foreground mb-6">
          We sent a verification link to{" "}
          <span className="font-semibold text-foreground">{email}</span>
          <br />
          Please check your email to activate your account.
        </p>

        {/* Countdown box */}
        <div className="bg-muted p-4 rounded-md mb-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Resend available in:
          </p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {formatTime(countdown)}
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0}
            className="w-full min-h-10 cursor-pointer"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Wait ${formatTime(countdown)}`
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full min-h-10"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
