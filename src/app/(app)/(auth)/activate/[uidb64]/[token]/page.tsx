// app/auth/activate/[uidb64]/[token]/page.tsx
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Lấy uidb64 và token từ URL
    const { uidb64, token } = params;

    // Đảm bảo params là string (Next.js 13+)
    if (typeof uidb64 !== "string" || typeof token !== "string") {
      setError("URL kích hoạt không hợp lệ.");
      setIsLoading(false);
      return;
    }

    const activateAccount = async () => {
      try {
        // 1. Gọi API (GET) mà backend đã định nghĩa
        await authApi.activate(uidb64, token);
        setSuccess(true);
      } catch (err: unknown) {
        // 2. Bắt lỗi (ví dụ: link hết hạn)
        if (isAxiosError(err) && err.response) {
          // Lấy message lỗi từ backend (nếu có)
          setError(
            err.response.data?.error ||
              "Link kích hoạt không hợp lệ hoặc đã hết hạn."
          );
        } else {
          setError("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Chạy hàm kích hoạt
    activateAccount();
  }, [params]); // Chạy 1 lần khi params (từ URL) sẵn sàng

  // Hàm render nội dung dựa trên state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Đang kích hoạt...</h2>
          <p>Vui lòng đợi trong giây lát.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-4 text-destructive">
          <XCircle className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Kích hoạt thất bại</h2>
          <p className="text-center">{error}</p>
          <Button asChild>
            <Link href="/register">Thử đăng ký lại</Link>
          </Button>
        </div>
      );
    }

    if (success) {
      return (
        <div className="flex flex-col items-center gap-4 text-green-600">
          <CheckCircle className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Kích hoạt thành công!</h2>
          <p>Tài khoản của bạn đã được kích hoạt.</p>
          <Button asChild>
            <Link href="/login">Đi đến trang đăng nhập</Link>
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md bg-background rounded-lg shadow p-8">
        {renderContent()}
      </div>
    </div>
  );
}
