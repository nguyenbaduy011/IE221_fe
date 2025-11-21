import { z } from "zod";

export const taskSchema = z.object({
  name: z.string().min(1, { message: "Tên nhiệm vụ là bắt buộc" }),
  subject_id: z.string().min(1, { message: "Vui lòng chọn môn học" }),
});

export type TaskFormValues = z.infer<typeof taskSchema>;