/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchemaTrainee,
  RegisterFormValuesTrainee,
} from "@/validations/authValidation";

import { authApi } from "@/lib/authApi";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValuesTrainee>({
    resolver: zodResolver(registerSchemaTrainee),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const getStrengthColor = (index: number) => {
    const strength = getPasswordStrength(passwordValue);

    if (index >= strength) return "bg-muted";
    if (strength <= 1) return "bg-destructive";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-primary";
    return "bg-green-600";
  };

  const onSubmit = async (data: RegisterFormValuesTrainee) => {
    setIsLoading(true);

    try {
      const res = await authApi.register(data);

      if (res.status === 201) {
        sessionStorage.setItem("pending_email", data.email);
        toast.success(
          res.data?.message || "Registration successful. Please verify email."
        );
        router.push("/verify-email");
      } else {
        toast.error(res.data?.message || "Failed to register.");
      }
    } catch (err: any) {
      console.error("Register Error:", err);

      if (isAxiosError(err) && err.response) {
        const errorData = err.response.data as any;

        if (errorData.email) {
          form.setFocus("email");
          toast.error(`Email: ${errorData.email[0]}`);
        } else if (errorData.fullName) {
          form.setFocus("fullName");
          toast.error(errorData.fullName[0]);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Failed to register. Please try again.");
        }
      } else {
        toast.error("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Sign Up</h1>
        <p className="text-muted-foreground mb-8">
          Create your account to get started
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <div className="h-px">
                    <FormMessage className="text-destructive text-xs leading-none" />
                  </div>
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <div className="h-px">
                    <FormMessage className="text-destructive text-xs leading-none" />
                  </div>
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                        placeholder="Enter password"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {/* Strength bar */}
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${getStrengthColor(
                              i
                            )}`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {getPasswordStrength(passwordValue) <= 1 && "Weak"}
                        {getPasswordStrength(passwordValue) === 2 && "Fair"}
                        {getPasswordStrength(passwordValue) === 3 && "Good"}
                        {getPasswordStrength(passwordValue) >= 4 && "Strong"}
                      </p>

                      {/* Optional: Forgot password */}
                      <button
                        type="button"
                        className="text-xs mt-2 text-primary hover:underline"
                        onClick={() => router.push("/forgot-password")}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <div className="h-px">
                    <FormMessage className="text-destructive text-xs leading-none" />
                  </div>
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="pr-10"
                        placeholder="Confirm password"
                        {...field}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <div className="h-px">
                    <FormMessage className="text-destructive text-xs leading-none" />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading}
              role="status"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                className="text-primary font-semibold hover:underline"
                type="button"
                onClick={() => router.push("/login")}
              >
                Sign in
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
