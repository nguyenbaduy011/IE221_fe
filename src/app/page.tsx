"use client";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log("Auth user:", user, "isAuthenticated:", isAuthenticated);
    return <div>Vui lòng đăng nhập để xem thông tin.</div>;
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
        </div>
      </div>
    </div>
  );
}
