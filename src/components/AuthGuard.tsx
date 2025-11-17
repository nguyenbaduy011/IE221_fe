// components/AuthGuard.tsx
"use client";

import { useAuth } from "@/context/AuthContext"; // Đường dẫn tới AuthContext của bạn
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner"; // Ví dụ component loading

const publicPaths = ["/login", "/register", "/activate", "/verify-email"]; // Các trang công khai

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isPublic = publicPaths.some((path) => pathname.startsWith(path));

    // 1. Nếu chưa đăng nhập VÀ đang cố vào trang private
    if (!isAuthenticated && !isPublic) {
      router.push("/login");
      return;
    }

    // 2. Nếu đã đăng nhập VÀ đang ở trang login/register
    if (isAuthenticated && isPublic) {
      // Điều hướng dựa trên vai trò (giống logic middleware cũ)
      const redirectTo =
        user?.role === "SUPERVISOR"
          ? "/supervisor/dashboard"
          : user?.role === "TRAINEE"
            ? "/trainee/courses"
            : "/"; // Trang chủ mặc định
      router.push(redirectTo);
      return;
    }

    // 3. (Nâng cao) Phân quyền dựa trên vai trò cho các trang private
    if (isAuthenticated && !isPublic) {
      if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
        router.push("/"); // Hoặc trang "không có quyền"
      }
      if (pathname.startsWith("/supervisor") && user?.role !== "SUPERVISOR") {
        router.push("/");
      }
      // v.v
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Nếu đang loading, hiển thị spinner toàn trang
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  // Nếu đã đăng nhập hoặc đang ở trang public, hiển thị nội dung
  return <>{children}</>;
}
