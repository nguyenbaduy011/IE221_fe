/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/authApi";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, LoginFormValues } from "@/validations/authValidation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isAxiosError } from "axios";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (formData: LoginFormValues) => {
    try {
      const res = await authApi.login(
        formData.email,
        formData.password,
        formData.rememberMe || false
      );

      if (res.status === 200 && res.data?.data?.access) {
        auth.login(res.data);
        toast.success("Đăng nhập thành công!");
        router.push("/");
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      if (isAxiosError(err) && err.response) {
        const data = err.response.data as any;
        const isNotActive =
          data.errors?.detail === "ACCOUNT_NOT_ACTIVE" ||
          data.errors?.code === "account_not_active";

        if (isNotActive) {
          toast.warning(
            "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email."
          );

          sessionStorage.setItem("pending_email", formData.email);
          router.push("/verify-email");
          return;
        }

        if (err.response.status === 401) {
          toast.error("Email hoặc mật khẩu không chính xác.");
        } else {
          toast.error(data.detail || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
      } else {
        toast.error("Lỗi kết nối hoặc lỗi không xác định.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Sign In</h1>
        <p className="text-muted-foreground mb-8">
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Password
            </label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("rememberMe")}
              id="remember"
              className="w-4 h-4 accent-primary rounded"
            />
            <label htmlFor="remember" className="text-sm text-foreground">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          {/* Sign up Link */}
          <div className="text-center text-sm text-foreground/70">
            <span>Don&apos;t have an account? </span>
            <Link
              type="button"
              className="text-primary font-semibold hover:underline"
              href="/register"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
