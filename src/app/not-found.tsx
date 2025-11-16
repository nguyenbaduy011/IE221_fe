import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full mx-auto text-center space-y-6 z-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground">
          Không tìm thấy trang
        </h2>
        <p className="text-muted-foreground mt-2">
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang truy cập. Có thể
          trang đã bị di chuyển, xóa, hoặc chưa từng tồn tại.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
