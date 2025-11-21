import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Tên danh mục là bắt buộc" }),
  subject_categories: z.array(
    z.object({
      subject_id: z.string().min(1, { message: "Vui lòng chọn môn" }),
    })
  )
  .min(1, { message: "Danh mục phải chứa ít nhất 1 môn học" })
  .refine((items) => {
    const ids = items.map((item) => item.subject_id);
    const uniqueIds = new Set(ids);
    return uniqueIds.size === ids.length;
  }, {
    message: "Không được chọn trùng môn học trong cùng một danh mục",
  }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;