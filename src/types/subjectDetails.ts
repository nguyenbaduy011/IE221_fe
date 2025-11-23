// types/subject-detail.ts

// Enum trạng thái của Task (Khớp với backend trả về "DONE" | "NOT_DONE")
export enum TaskStatus {
  DONE = "DONE",
  NOT_DONE = "NOT_DONE",
}

// Interface cho từng nhiệm vụ nhỏ
export interface UserTask {
  id: number;
  name: string;
  status: TaskStatus;
}

// Interface cho danh sách học viên bên Sidebar
export interface Trainee {
  id: number;
  full_name: string;
  avatar?: string | null; // Backend trả về null nếu không có ảnh
  email: string;
}

export interface CommentHistory {
  id: number;
  user: {
    id: number;
    full_name: string;
    email?: string;
  };
  content: string;
  created_at: string;
}

// Interface chi tiết môn học (Dữ liệu chính của trang)
export interface SubjectDetail {
  id: number; // ID của UserSubject (để gọi API complete/assessment)
  name: string; // Tên môn học
  course_name: string;
  supervisor_name: string;
  last_updated: string; // ISO Date string
  duration: string;

  // Ngày kế hoạch
  start_date: string;
  end_date: string;

  // Ngày thực tế (Có thể null nếu chưa bắt đầu/kết thúc)
  actual_start_date?: string | null;
  actual_end_date?: string | null;

  // Đánh giá (Có thể null nếu chưa chấm)
  score?: number | null;
  max_score: number;
  supervisor_comment?: string | null;

  // Danh sách task và trạng thái chung
  tasks: UserTask[];
  status: "IN_PROGRESS" | "COMPLETED";
  comment_history?: CommentHistory[];
  comment_updated_at?: string | null;
}
