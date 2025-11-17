// src/validations/authValidation.ts
import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchemaTrainee = z
  .object({
    fullName: z.string().min(2, "Họ và tên không được để trống"),
    email: z.email("Email không hợp lệ"),

    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ in hoa (A-Z)")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường (a-z)")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số (0-9)")
      .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords phải trùng nhau",
    path: ["confirmPassword"],
  });

export type RegisterFormValuesTrainee = z.infer<typeof registerSchemaTrainee>;

export const registerSchemaAdmin = registerSchemaTrainee.safeExtend({
  role: z.enum(["TRAINEE", "SUPERVISOR"], "Chọn role hợp lệ"),
});

export type RegisterFormValuesAdmin = z.infer<typeof registerSchemaAdmin>;
