import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().min(1, { message: "Task name is required" }),
  subject_id: z.string().min(1, { message: "Please select a subject" }),
});

export const updateTaskSchema = z.object({
  status: z.number().optional(),
  spent_time: z.coerce
    .number()
    .min(0, { message: "Spent time cannot be negative" })
    .optional(),
  submission_file: z.any().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
