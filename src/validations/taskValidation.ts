import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().min(1, { message: "Task name is required" }),
  subject_id: z.string().min(1, { message: "Please select a subject" }),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
