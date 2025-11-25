// validations/courseValidation.ts
import * as z from "zod";
import dayjs from "dayjs";

export const courseSchema = z
  .object({
    name: z.string().min(3, "Course's name must have at least 3 letters"),
    link_to_course: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        try {
          z.string().url().parse(val);
          return true;
        } catch {
          return false;
        }
      }, "Invalid URL format"),
    start_date: z.string().min(1, "Choose a Start Date"),
    finish_date: z.string().min(1, "Choose a Finish Date"),
    subject_ids: z.array(z.number()),
    supervisor_ids: z.array(z.number()).min(1, "Select at least 1 trainer"),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.finish_date) return true;
      const start = dayjs(data.start_date);
      const end = dayjs(data.finish_date);
      return end.isAfter(start);
    },
    {
      message: "Finish Date must be after Start Date",
      path: ["finish_date"],
    }
  );

export type CourseFormValues = z.infer<typeof courseSchema>;
