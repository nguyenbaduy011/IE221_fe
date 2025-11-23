import axiosClient from "@/lib/axiosClient";
import { DashboardCourse } from "@/types/course";
import { User } from "@/types/user";

// --- INTERFACES ---
export interface Task {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  estimated_time_days: number;
  max_score: number;
}

export interface AdminCourseSubject {
  id: number;
  position: number;
  start_date: string | null;
  finish_date: string | null;
  subject: {
    id: number;
    name: string;
    estimated_time_days: number;
    image?: string | null;
    max_score?: number;
    tasks: Task[];
  };
}

export interface AdminCourseDetail extends DashboardCourse {
  supervisors: { id: number; supervisor: User }[];
}

// --- ADMIN API OBJECT ---
export const adminApi = {
  // ... (Giữ nguyên các hàm cũ: getCourseDetail, updateCourse, getAllCourses...) ...
  getCourseDetail(id: number) {
    return axiosClient.get<AdminCourseDetail>(`/api/admin/courses/${id}/`);
  },
  updateCourse(id: number, data: Partial<DashboardCourse>) {
    return axiosClient.patch<DashboardCourse>(`/api/admin/courses/${id}/`, data);
  },
  getAllCourses() {
    return axiosClient.get<DashboardCourse[]>("/api/admin/courses/");
  },
  
  // --- TRAINEES & SUPERVISORS (Giữ nguyên) ---
  getTrainees(courseId: number) {
    return axiosClient.get<User[]>(`/api/admin/courses/${courseId}/trainees/`);
  },
  addTrainees(courseId: number, traineeIds: number[]) {
    return axiosClient.post(`/api/admin/courses/${courseId}/add-trainees/`, { trainee_ids: traineeIds });
  },
  removeTrainee(courseId: number, traineeId: number) {
    return axiosClient.delete(`/api/admin/courses/${courseId}/remove-trainee/`, { data: { id: traineeId } });
  },
  addSupervisors(courseId: number, supervisorIds: number[]) {
    return axiosClient.post(`/api/admin/courses/${courseId}/add-supervisors/`, { supervisor_ids: supervisorIds });
  },
  removeSupervisor(courseId: number, supervisorId: number) {
    return axiosClient.delete(`/api/admin/courses/${courseId}/remove-supervisor/`, { data: { id: supervisorId } });
  },

  // --- SUBJECTS & TASKS (CẬP NHẬT PHẦN NÀY) ---

  // 1. Lấy danh sách Subject có sẵn (Search) -> Fix lỗi tìm kiếm
  getAllSubjects(params?: { search?: string }) {
    return axiosClient.get<Subject[]>("/api/admin/subjects/", { params });
  },

  // 2. Add Subject vào Course
  addSubject(courseId: number, data: any) {
    return axiosClient.post(`/api/admin/courses/${courseId}/add-subject/`, data);
  },

  // 3. Get Course Subjects
  getCourseSubjects(courseId: number) {
    return axiosClient.get<AdminCourseSubject[]>(`/api/admin/courses/${courseId}/subjects/`);
  },

  // 4. Update Course Subject info
  updateCourseSubject(id: number, data: any) {
    return axiosClient.patch(`/api/admin/course-subjects/${id}/`, data);
  },

  // 5. Remove Subject
  removeSubject(courseId: number, courseSubjectId: number) {
    return axiosClient.delete(`/api/admin/courses/${courseId}/remove-subject/`, { data: { id: courseSubjectId } });
  },

  // 6. Reorder
  reorderSubjects(courseId: number, items: { id: number; position: number }[]) {
    return axiosClient.post(`/api/admin/courses/${courseId}/reorder-subjects/`, { items });
  },

  // 7. ADD TASK (Fix lỗi dấu +)
  addTask(courseId: number, courseSubjectId: number, taskName: string) {
    // Lưu ý: Backend bạn định nghĩa url_path="add-task" trong ViewSet "courses"
    // Nên URL thường là /api/courses/{id}/add-task/ hoặc /api/admin/courses/{id}/add-task/
    // tuỳ thuộc vào router register của bạn.
    // Dựa vào code urls.py bạn gửi trước đó, bạn register router 'courses'
    return axiosClient.post(`/api/admin/courses/${courseId}/add-task/`, {
      course_subject_id: courseSubjectId,
      name: taskName,
    });
  },
};