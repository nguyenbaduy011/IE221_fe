import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tên môn học không được để trống" }),  
  max_score: z.coerce
    .number()
    .min(0, { message: "Điểm tối đa phải lớn hơn hoặc bằng 0" }),
    
  estimated_time_days: z.coerce
    .number()
    .min(0, { message: "Thời lượng phải lớn hơn hoặc bằng 0" }),
    
  // Dùng cho màn hình Edit để quản lý danh sách task
  tasks: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, { message: "Tên nhiệm vụ không được để trống" }),
      position: z.number().optional(),
      _destroy: z.boolean().optional() 
    })
  ).optional()
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;