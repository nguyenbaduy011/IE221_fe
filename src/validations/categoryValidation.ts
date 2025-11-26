import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  subject_categories: z
    .array(
      z.object({
        subject_id: z.string().min(1, { message: "Please select a subject" }),
      })
    )
    .min(1, { message: "Category must contain at least 1 subject" })
    .refine(
      (items) => {
        const ids = items.map((item) => item.subject_id);
        const uniqueIds = new Set(ids);
        return uniqueIds.size === ids.length;
      },
      {
        message: "Duplicate subjects are not allowed in the same category",
      }
    ),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
