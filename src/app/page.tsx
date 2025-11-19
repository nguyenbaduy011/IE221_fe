"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    console.log("Auth user:", user, "isAuthenticated:", isAuthenticated);
    return (
      <div>
        <div>Vui lòng đăng nhập để xem thông tin.</div>
        <Button
          onClick={() => {
            router.push("/login");
          }}
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Thông tin người dùng
        </h1>

        <div className="space-y-2">
          <p>
            <strong>Họ và tên:</strong> {user?.full_name}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Vai trò:</strong> {user?.role}
          </p>
          <p>
            <strong>ID:</strong> {user?.id}
          </p>
          {/* Button này giờ đã hoạt động */}
          <Button onClick={handleLogout}>Đăng xuất</Button>
        </div>
      </div>
    </div>
  );
}
