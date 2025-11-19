"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full mx-auto text-center space-y-6 z-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mt-2">
          Sorry, we couldn&rsquo;t find the page you were looking for. It may
          have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
