/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchemaTrainee = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter (A-Z)"
      )
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter (a-z)"
      )
      .regex(/[0-9]/, "Password must contain at least one number (0-9)")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValuesTrainee = z.infer<typeof registerSchemaTrainee>;

export const registerSchemaAdmin = registerSchemaTrainee.safeExtend({
  role: z.enum(["TRAINEE", "SUPERVISOR"], "Select a valid role" as any),
});

export type RegisterFormValuesAdmin = z.infer<typeof registerSchemaAdmin>;
