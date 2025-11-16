/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  registerSchemaTrainee,
  RegisterFormValuesTrainee,
} from "@/validations/authValidation";
import { authApi } from "@/lib/authApi";
import { useRouter } from "next/navigation";

import { Progress } from "@/components/ui/progress";
import { Check, X, Eye, EyeOff, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValuesTrainee>({
    resolver: zodResolver(registerSchemaTrainee),
  });

  const passwordValue = watch("password");

  useEffect(() => {
    const pwd = passwordValue || "";

    const req = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    const strength =
      (req.length ? 20 : 0) +
      (req.uppercase ? 20 : 0) +
      (req.lowercase ? 20 : 0) +
      (req.number ? 20 : 0) +
      (req.special ? 20 : 0);

    setPasswordRequirements(req);
    setPasswordStrength(strength);
  }, [passwordValue]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-destructive";
    if (passwordStrength < 80) return "bg-amber-500";
    return "bg-green-500";
  };


  const onSubmit = async (data: RegisterFormValuesTrainee) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);

      if (res.status === 201 && res.data.message) {
        toast.success(res.data.message);

      } else {
        toast.error(res.data?.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md bg-background rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fullname */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant={null}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}

            {/* Password Strength Bar */}
            <div className="space-y-1">
              <div className="text-sm font-medium">Password Strength</div>
              <Progress
                value={passwordStrength}
                className={`h-2 ${getStrengthColor()}`}
              />
            </div>

            {/* Password Requirements */}
            <ul className="space-y-1 text-sm">
              {[
                { key: "length", label: "At least 8 characters" },
                { key: "uppercase", label: "At least one uppercase letter" },
                { key: "lowercase", label: "At least one lowercase letter" },
                { key: "number", label: "At least one number" },
                { key: "special", label: "At least one special character" },
              ].map((item) => {
                const ok =
                  passwordRequirements[
                    item.key as keyof typeof passwordRequirements
                  ];
                return (
                  <li key={item.key} className="flex items-center gap-2">
                    {ok ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        ok ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant={null}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </div>
    </div>
  );
}
