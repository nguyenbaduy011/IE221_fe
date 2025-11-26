import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, { message: "Subject name is required" }),
  max_score: z.coerce
    .number()
    .min(0, { message: "Max score must be greater than or equal to 0" }),

  estimated_time_days: z.coerce
    .number()
    .min(0, { message: "Estimated time must be greater than or equal to 0" }),

  tasks: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1, { message: "Task name is required" }),
        position: z.number().optional(),
        _destroy: z.boolean().optional(),
      })
    )
    .optional(),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
