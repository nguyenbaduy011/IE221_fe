// types/course.ts
import { User } from "./user";

/**
 * Kiểu cho model Category (Danh mục)
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Kiểu cho model Subject (Môn học)
 */
export interface Subject {
  id: number;
  name: string;
  max_score: number;
  estimated_time_days?: number | null;
  categories?: Category[]; // API của bạn có thể sẽ trả về nested
}

/**
 * Kiểu cho model Task (Nhiệm vụ)
 */
export interface Task {
  id: number;
  name: string;
  // Các trường GenericForeignKey (taskable)
  content_type: number;
  object_id: number;
}

/**
 * Kiểu cho bảng trung gian CourseSupervisor
 * (Thông tin một Supervisor trong một Course)
 */
export interface CourseSupervisor {
  id: number;
  course: number; // ID của khóa học
  supervisor: User; // API nên trả về object User nested
  created_at: string;
}

/**
 * Kiểu cho bảng trung gian CourseSubject
 * (Thông tin một Môn học trong một Course)
 */
export interface CourseSubject {
  id: number;
  course: number; // ID của khóa học
  subject: Subject; // API nên trả về object Subject nested
  position?: number | null;
  start_date?: string | null;
  finish_date?: string | null;
}

/**
 * Kiểu cho model Course (Khóa học)
 * Đây là kiểu dữ liệu chính, phức tạp nhất
 */
export interface Course {
  id: number;
  name: string;
  link_to_course?: string | null;
  image?: string | null; // ImageField -> string (URL)
  start_date: string;
  finish_date: string;
  creator: User; // API nên trả về object User nested
  status: number; // Bạn có thể tạo Enum (0, 1, 2)
  created_at: string;
  updated_at: string;

  // Mối quan hệ M2M (thường là mảng các object nested)
  course_supervisors: CourseSupervisor[];
  course_subjects: CourseSubject[];
}

export enum CourseStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  FINISHED = 2,
}

// Interface cho Course trả về từ API SupervisorMyCourseListView
export interface DashboardCourse {
  id: number;
  name: string;
  link_to_course: string | null;
  image: string | null;
  start_date: string;
  finish_date: string;
  status: CourseStatus;
  created_at: string;
  member_count: number;
  supervisor_count: number;
}
// types/dashboard.ts

export interface DashboardStats {
  total_supervisors: number; // Tổng số supervisor (có thể lấy từ user list hoặc count)
  total_trainees: number; // Tổng số học viên đang phụ trách
  active_courses: number; // Số khóa học đang In Progress
  completion_rate: number; // Tỷ lệ hoàn thành trung bình (%)
}