import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full mx-auto text-center space-y-6 z-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="text-muted-foreground mt-2">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
