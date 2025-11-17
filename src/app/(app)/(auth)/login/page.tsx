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
        console.log("Backend Response Data:", data);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
        <p className="text-gray-600 mb-8">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">
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
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          {/* Sign up Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <button
              type="button"
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => router.push("/register")}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
