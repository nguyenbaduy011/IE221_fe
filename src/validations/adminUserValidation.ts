import { z } from "zod";
import { UserRole } from "@/types/user";

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  full_name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),

  role: z
    .enum(["ADMIN", "SUPERVISOR", "TRAINEE"] as const)
    .refine((value) => !!value, { message: "Please select a role" }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(["ADMIN", "SUPERVISOR", "TRAINEE"]),
  birthday: z.string().optional().nullable(),
  gender: z.enum(["1", "2", "unknown"]).optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
