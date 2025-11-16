// types/common.ts
import { User } from "./user";

/**
 * Kiểu cho model DailyReport
 */
export interface DailyReport {
  id: number;
  user: number; // ID của Trainee
  course: number; // ID của Course
  content?: string | null;
  status: number; // Bạn có thể tạo Enum
  created_at: string;
  updated_at: string;
}

/**
 * Kiểu cho model Comment
 */
export interface Comment {
  id: number;
  user: User; // API nên trả về object User nested
  content: string;
  created_at: string;

  // Trường GenericForeignKey 'commentable'
  content_type: number;
  object_id: number;
}
