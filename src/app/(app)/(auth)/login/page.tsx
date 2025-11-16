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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await authApi.login(
        data.email,
        data.password,
        data.rememberMe || false
      );

      if (res.status === 200 && res.data?.data?.access) {
        auth.login(res.data);
        toast("Login success");
        router.push("/");
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
    } catch (err: any) {
      console.error(err);
      if (isAxiosError(err) && err.response?.status === 401) {
        toast.error("Đăng nhập thất bại. Sai email hoặc mật khẩu.");
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("rememberMe")}
              id="remember"
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="remember" className="select-none">
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
