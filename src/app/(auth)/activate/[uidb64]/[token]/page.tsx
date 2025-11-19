"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/authApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";

export default function ActivateAccountPage() {
  const params = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { uidb64, token } = params;

    if (typeof uidb64 !== "string" || typeof token !== "string") {
      setError("Invalid activation link.");
      setIsLoading(false);
      return;
    }

    const activate = async () => {
      try {
        await authApi.activate(uidb64, token);
        setSuccess(true);
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          setError(
            err.response.data?.error || "Activation link is invalid or expired."
          );
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    activate();
  }, [params]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Activating your account...
          </h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive">
            Activation Failed
          </h2>
          <p className="text-muted-foreground">{error}</p>

          <Button asChild className="min-h-10">
            <Link href="/register">Register Again</Link>
          </Button>
        </div>
      );
    }

    if (success) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
          <h2 className="text-xl font-semibold text-foreground">
            Account Activated!
          </h2>
          <p className="text-muted-foreground">
            Your account has been successfully activated.
          </p>

          <Button asChild className="min-h-10">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-lg shadow p-8">
        {renderContent()}
      </div>
    </div>
  );
}
