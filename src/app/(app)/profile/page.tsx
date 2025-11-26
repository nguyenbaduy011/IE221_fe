/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/authApi";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { format } from "date-fns";

import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormValues,
  type ChangePasswordFormValues,
} from "@/validations/profileValidation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  UserIcon,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
      birthday: "",
      gender: "",
    },
  });

  // --- SỬA ĐỔI QUAN TRỌNG: Cập nhật form khi có user data ---
  useEffect(() => {
    if (user) {
      console.log("User data loaded into Form:", user);

      profileForm.reset({
        fullName: user.full_name || "",
        birthday: user.birthday || "",
        gender:
          user.gender !== null && user.gender !== undefined
            ? String(user.gender)
            : "",
      });
    }
  }, [user, profileForm]);

  const onUpdateProfile = async (data: UpdateProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Khi gửi lên, birthday rỗng ("") nên gửi là null để backend không lỗi date format
      await authApi.updateProfile({
        ...data,
        birthday: data.birthday ? data.birthday : null,
      });

      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- FORM 2: CHANGE PASSWORD ---
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = passwordForm.watch("newPassword");

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const getStrengthColor = (index: number) => {
    const strength = getPasswordStrength(newPasswordValue);
    if (index >= strength) return "bg-muted";
    if (strength <= 1) return "bg-destructive";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-primary";
    return "bg-green-600";
  };

  const onChangePassword = async (data: ChangePasswordFormValues) => {
    setIsChangingPass(true);
    try {
      await authApi.changePassword(data);
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        const errorData = err.response.data as any;
        if (errorData.old_password) {
          passwordForm.setError("currentPassword", {
            message: errorData.old_password[0],
          });
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Failed to change password.");
        }
      } else {
        toast.error("Network error.");
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and security settings.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6">
              {/* User Overview Card */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Account Overview</CardTitle>
                  <CardDescription>
                    View your account information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Email */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                      <p className="text-sm font-medium break-all">
                        {user.email}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        Role
                      </div>
                      <p className="text-sm font-medium capitalize">
                        {user.role?.toLowerCase()}
                      </p>
                    </div>

                    {/* Joined Date */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Joined
                      </div>
                      <p className="text-sm font-medium">
                        {user.date_joined
                          ? format(new Date(user.date_joined), "dd MMM yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Edit Card */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                      className="space-y-6"
                    >
                      {/* Full Name */}
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                {...field}
                                className="h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Gender Select */}
                        <FormField
                          control={profileForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Gender
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                // Ép kiểu về string để khớp với value của SelectItem
                                value={
                                  field.value ? String(field.value) : undefined
                                }
                                // QUAN TRỌNG: Thêm key để ép re-render khi giá trị thay đổi
                                key={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-10 cursor-pointer">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* Value phải là string */}
                                  <SelectItem value="1">Male</SelectItem>
                                  <SelectItem value="2">Female</SelectItem>
                                  <SelectItem value="3">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Birthday */}
                        <FormField
                          control={profileForm.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Date of Birth
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  // Xử lý null/undefined thành chuỗi rỗng
                                  value={field.value || ""}
                                  className="h-10"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full sm:w-auto h-10 cursor-pointer"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is secure with a strong password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onChangePassword)}
                    className="space-y-6 max-w-md"
                  >
                    {/* Current Password */}
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Current Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPass ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="h-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCurrentPass(!showCurrentPass)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showCurrentPass ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-2" />

                    {/* New Password */}
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            New Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPass ? "text" : "password"}
                                placeholder="Enter new password"
                                {...field}
                                className="h-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPass(!showNewPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showNewPass ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>

                          {/* Password Strength Indicator */}
                          {newPasswordValue && (
                            <div className="mt-3 space-y-2">
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className={`h-2 flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(
                                      i
                                    )}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Strength:{" "}
                                <span className="font-semibold">
                                  {getPasswordStrength(newPasswordValue) <= 1 &&
                                    "Weak"}
                                  {getPasswordStrength(newPasswordValue) ===
                                    2 && "Fair"}
                                  {getPasswordStrength(newPasswordValue) ===
                                    3 && "Good"}
                                  {getPasswordStrength(newPasswordValue) >= 4 &&
                                    "Strong"}
                                </span>
                              </p>
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Confirm New Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPass ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...field}
                                className="h-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPass(!showConfirmPass)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPass ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isChangingPass}
                      className="w-full sm:w-auto h-10 cursor-pointer"
                    >
                      {isChangingPass ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <KeyRound className="w-4 h-4 mr-2" />
                      )}
                      Change Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
