/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "@/lib/axiosClient";
import {  DashboardCourse, DashboardStats } from "@/types/course";
import { User } from "@/types/user";

export interface SupervisorCourseDetail extends DashboardCourse {
  supervisors: { id: number; supervisor: User }[];
}

export const supervisorApi = {
  getMyCourses() {
    return axiosClient.get<any>("/api/supervisor/courses/my-courses/");
  },

  async getStats(): Promise<DashboardStats> {
    try {
      const res = await axiosClient.get<any>("/api/supervisor/stats/");
      const data = res.data?.data || res.data;

      return {
        total_supervisors: data.total_supervisors || 0,
        total_trainees: data.total_trainees || 0,
        active_courses: data.active_courses || 0,
        completion_rate: data.completion_rate || 0,
        chart_data: Array.isArray(data.chart_data) ? data.chart_data : [],
        recent_activities: Array.isArray(data.recent_activities)
          ? data.recent_activities
          : [],
      };
    } catch (error) {
      console.error("Error fetching stats", error);
      return {
        total_supervisors: 0,
        total_trainees: 0,
        active_courses: 0,
        completion_rate: 0,
        chart_data: [],
        recent_activities: [],
      };
    }
  },
  getCourseDetail(id: number) {
    return axiosClient.get<SupervisorCourseDetail>(`/api/supervisor/courses/${id}/`);
  },

  updateCourse(id: number, data: Partial<DashboardCourse>) {
    return axiosClient.patch(`/api/supervisor/courses/${id}/update/`, data);
  },

  // --- 3. TRAINEE MANAGEMENT ---

  getTrainees(courseId: number) {
    return axiosClient.get<User[]>(`/api/supervisor/courses/${courseId}/students/`);
  },

  addTrainees(courseId: number, traineeIds: number[]) {
    return axiosClient.post(`/api/supervisor/courses/${courseId}/add-trainees/`, {
      trainee_ids: traineeIds,
    });
  },

  removeTrainee(courseId: number, traineeId: number) {
    return axiosClient.delete(`/api/supervisor/courses/${courseId}/remove-trainee/`, {
      data: { id: traineeId },
    });
  },

  // --- 4. SUPERVISOR MANAGEMENT ---
  // (Cho phép Supervisor thêm/xóa đồng nghiệp vào cùng khóa học nếu backend cho phép)
  
  addSupervisors(courseId: number, supervisorIds: number[]) {
    return axiosClient.post(`/api/supervisor/courses/${courseId}/add-supervisors/`, {
      supervisor_ids: supervisorIds,
    });
  },

  removeSupervisor(courseId: number, supervisorId: number) {
    return axiosClient.delete(`/api/supervisor/courses/${courseId}/remove-supervisor/`, {
      data: { id: supervisorId },
    });
  },

  // --- 5. SUBJECT MANAGEMENT (Nội dung khóa học) ---

  // Lấy danh sách môn học của khóa
  getSubjects(courseId: number) {
    // Route này cần được thêm vào urls.py: path("supervisor/courses/<int:pk>/subjects/", ...)
    return axiosClient.get(`/api/supervisor/courses/${courseId}/subjects/`);
  },

  // Thêm môn học (Mới hoặc Có sẵn)
  addSubject(courseId: number, data: any) {
    return axiosClient.post(`/api/supervisor/courses/${courseId}/add-subject/`, data);
  },

  // Xóa môn học khỏi khóa
  removeSubject(courseId: number, courseSubjectId: number) {
    return axiosClient.delete(`/api/supervisor/courses/${courseId}/remove-subject/`, {
      data: { id: courseSubjectId },
    });
  },

  // Sắp xếp lại thứ tự môn học (Drag & Drop)
  reorderSubjects(courseId: number, items: { id: number; position: number }[]) {
    // Route cần thêm: path("supervisor/courses/<int:pk>/reorder-subjects/", ...)
    return axiosClient.post(`/api/supervisor/courses/${courseId}/reorder-subjects/`, { 
      items 
    });
  },

  updateCourseSubject(id: number, data: any) {
    return axiosClient.patch(`/api/supervisor/course-subjects/${id}/`, data); 
  },

  // --- 6. TASK MANAGEMENT ---

  addTask(courseId: number, courseSubjectId: number, name: string) {
    // Route cần thêm: path("supervisor/courses/<int:pk>/add-task/", ...)
    return axiosClient.post(`/api/supervisor/courses/${courseId}/add-task/`, {
      course_subject_id: courseSubjectId,
      name,
    });
  },

  updateTask(taskId: number, name: string) {
    // Route cần thêm: path("supervisor/tasks/<int:pk>/detail/", ...)
    return axiosClient.patch(`/api/supervisor/tasks/${taskId}/detail/`, { name });
  },

  deleteTask(taskId: number) {
    // Route cần thêm: path("supervisor/tasks/<int:pk>/detail/", ...)
    return axiosClient.delete(`/api/supervisor/tasks/${taskId}/detail/`);
  },
};
