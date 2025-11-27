"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getHomeUrl } from "@/lib/roleUtils";

export default function Home() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    const targetUrl = getHomeUrl(user.role);
    if (targetUrl !== "/") {
      router.push(targetUrl);
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Hệ thống LMS</h2>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để truy cập vào không gian làm việc của bạn.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full cursor-pointer"
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
          Thông tin người dùng
        </h1>

        <div className="space-y-4">
          <div className="space-y-2 text-sm text-foreground">
            <p>
              <strong className="font-semibold">Họ và tên:</strong>{" "}
              {user?.full_name}
            </p>
            <p>
              <strong className="font-semibold">Email:</strong> {user?.email}
            </p>
            <p>
              <strong className="font-semibold">Vai trò:</strong> {user?.role}
            </p>
            <p>
              <strong className="font-semibold">ID:</strong> {user?.id}
            </p>
          </div>

          <div className="p-3 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 text-xs rounded-md">
            Không thể chuyển hướng tự động do vai trò người dùng không xác định.
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full cursor-pointer"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
