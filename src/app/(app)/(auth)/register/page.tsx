/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  registerSchemaTrainee,
  RegisterFormValuesTrainee,
} from "@/validations/authValidation";
import { authApi } from "@/lib/authApi";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormValuesTrainee>({
    resolver: zodResolver(registerSchemaTrainee),
  });

  const password = useWatch({ control });
  const passwordValue =
    typeof password === "object" ? (password as any)?.password || "" : "";

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength(passwordValue);
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-yellow-500";
    if (strength <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const onSubmit = async (data: RegisterFormValuesTrainee) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);

      if (res.status === 201) {
        sessionStorage.setItem("pending_email", data.email);

        toast.success(
          res.data?.message || "Đăng ký thành công! Vui lòng kiểm tra email."
        );

        router.push("/verify-email");
      } else {
        toast.error(res.data?.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error("Register Error:", err);

      if (isAxiosError(err) && err.response) {
        const errorData = err.response.data as any;

        if (errorData.email) {
          toast.error(`Email: ${errorData.email[0]}`);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
        }
      } else {
        toast.error("Lỗi kết nối hoặc lỗi không xác định.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
        <p className="text-gray-600 mb-8">Create your account to get started</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <Input {...register("fullName")} placeholder="John Doe" />
            {errors.fullName && (
              <p className="text-red-600 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

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
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordValue && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i < getPasswordStrength(passwordValue)
                          ? getPasswordStrengthColor()
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getPasswordStrength(passwordValue) <= 1 && "Weak"}
                  {getPasswordStrength(passwordValue) === 2 && "Fair"}
                  {getPasswordStrength(passwordValue) === 3 && "Good"}
                  {getPasswordStrength(passwordValue) >= 4 && "Strong"}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>

          {/* Sign in Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <button
              type="button"
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
