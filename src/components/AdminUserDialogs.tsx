"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, UserRole } from "@/types/user";
import { CreateUserPayload, UpdateUserPayload } from "@/lib/userApi";
import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormValues,
  UpdateUserFormValues,
} from "@/validations/adminUserValidation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// --- Dialog Tạo User ---
interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserPayload) => Promise<void>;
  loading: boolean;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: CreateUserDialogProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "TRAINEE",
    },
  });

  // Reset form khi mở dialog
  React.useEffect(() => {
    if (open) {
      form.reset({
        email: "",
        full_name: "",
        role: "TRAINEE",
      });
    }
  }, [open, form]);

  const handleSubmit = (values: CreateUserFormValues) => {
    onSubmit({
      email: values.email,
      full_name: values.full_name,
      role: values.role as UserRole,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRAINEE">TRAINEE</SelectItem>
                      <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- Dialog Sửa User ---
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (id: number, data: UpdateUserPayload) => Promise<void>;
  loading: boolean;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading,
}: EditUserDialogProps) {
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "TRAINEE",
      birthday: "",
      gender: "unknown",
    },
  });

  // Load dữ liệu user vào form khi mở dialog
  React.useEffect(() => {
    if (user && open) {
      // Convert gender số sang string cho Select
      let genderStr: "1" | "2" | "unknown" = "unknown";
      if (user.gender === 1) genderStr = "1";
      if (user.gender === 2) genderStr = "2";

      form.reset({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        birthday: user.birthday || "",
        gender: genderStr,
      });
    }
  }, [user, open, form]);

  const handleSubmit = (values: UpdateUserFormValues) => {
    if (!user) return;

    // Convert gender từ string UI về number/null API
    let genderPayload: number | null = null;
    if (values.gender === "1") genderPayload = 1;
    if (values.gender === "2") genderPayload = 2;
    // "unknown" sẽ là null

    onSubmit(user.id, {
      email: values.email,
      full_name: values.full_name,
      role: values.role as UserRole,
      birthday: values.birthday || null,
      gender: genderPayload,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRAINEE">TRAINEE</SelectItem>
                      <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthday</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="YYYY-MM-DD"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // Dùng value thay vì defaultValue để sync với reset()
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
