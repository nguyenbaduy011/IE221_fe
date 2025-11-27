"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const publicPaths = ["/login", "/register", "/activate", "/verify-email"];

const getHomeUrl = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPERVISOR":
      return "/supervisor/dashboard";
    case "TRAINEE":
      return "/trainee/courses";
    default:
      return "/";
  }
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Nếu đang load thì chưa làm gì
    if (isLoading) {
      return;
    }

    const isPublic = publicPaths.some((path) => pathname.startsWith(path));

    if (!isAuthenticated && !isPublic) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && isPublic) {
      const homeUrl = getHomeUrl(user?.role);
      router.push(homeUrl);
      return;
    }

    if (isAuthenticated && !isPublic) {
      const userRole = user?.role;
      const homeUrl = getHomeUrl(userRole);

      if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
        router.push(homeUrl);
        return;
      }

      if (pathname.startsWith("/supervisor") && userRole !== "SUPERVISOR") {
        router.push(homeUrl);
        return;
      }

      if (pathname.startsWith("/trainee") && userRole !== "TRAINEE") {
        router.push(homeUrl);
        return;
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
