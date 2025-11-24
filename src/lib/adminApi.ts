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

export interface CreateCoursePayload {
  name: string;
  start_date: string; // Format: YYYY-MM-DD
  finish_date: string; // Format: YYYY-MM-DD
  link_to_course?: string;
  image?: File | null; // Sử dụng kiểu File cho upload ảnh
  status?: number; // 0: Not Started, 1: In Progress...
  
  // Danh sách ID (nếu tạo luôn môn học/supervisor kèm theo)
  subjects?: number[]; 
  supervisors?: number[]; 
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
    return axiosClient.post(`/api/admin/courses/${courseId}/add-task/`, {
      course_subject_id: courseSubjectId, // Phải khớp với request.data.get bên backend
      name: taskName,
    });
  },

  createCourse(payload: CreateCoursePayload) {
    const formData = new FormData();

    // 1. Append các trường cơ bản
    formData.append("name", payload.name);
    formData.append("start_date", payload.start_date);
    formData.append("finish_date", payload.finish_date);
    
    if (payload.link_to_course) {
      formData.append("link_to_course", payload.link_to_course);
    }
    
    // Mặc định status là 0 (Not Started) nếu không truyền
    if (payload.status !== undefined) {
      formData.append("status", payload.status.toString());
    }

    // 2. Xử lý File ảnh (Quan trọng)
    if (payload.image) {
      formData.append("image", payload.image);
    }

    // 3. Xử lý Mảng (Subjects & Supervisors)
    // Django DRF thường nhận mảng dạng: key=value1&key=value2...
    // Nên ta append cùng một key nhiều lần.
    if (payload.subjects && payload.subjects.length > 0) {
      payload.subjects.forEach((id) => {
        formData.append("subjects", id.toString());
      });
    }

    if (payload.supervisors && payload.supervisors.length > 0) {
      payload.supervisors.forEach((id) => {
        formData.append("supervisors", id.toString());
      });
    }

    // 4. Gửi Request
    return axiosClient.post<DashboardCourse>("/api/admin/courses/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Bắt buộc để upload file
      },
    });
  },

  deleteCourse(id: number) {
    return axiosClient.delete(`/api/admin/courses/${id}/delete/`);
  },

  updateTask(taskId: number, name: string) {
    return axiosClient.patch(`/api/admin/tasks/${taskId}/detail/`, { name });
  },

  deleteTask(taskId: number) {
    return axiosClient.delete(`/api/admin/tasks/${taskId}/detail/`);
  },
};