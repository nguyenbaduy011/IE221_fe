"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const publicPaths = ["/login", "/register", "/activate", "/verify-email"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isPublic = publicPaths.some((path) => pathname.startsWith(path));

    if (!isAuthenticated && !isPublic) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && isPublic) {
      const redirectTo =
        user?.role === "SUPERVISOR"
          ? "/supervisor/dashboard"
          : user?.role === "TRAINEE"
            ? "/trainee/courses"
            : user?.role === "ADMIN"
              ? "/admin/dashboard"
            : "/";
      router.push(redirectTo);
      return;
    }

    if (isAuthenticated && !isPublic) {
      if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
        router.push("/");
      }
      if (pathname.startsWith("/supervisor") && user?.role !== "SUPERVISOR") {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
