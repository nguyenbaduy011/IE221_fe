/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "@/lib/axiosClient";
import { Category, DashboardCourse, DashboardStats } from "@/types/course";
import { User } from "@/types/user";

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
  start_date: string;
  finish_date: string;
  link_to_course?: string;
  image?: File | null;
  status?: number;

  subjects?: number[];
  supervisors?: number[];
  categories?: number[];
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

export const adminApi = {
  getCourseDetail(id: number) {
    return axiosClient.get<AdminCourseDetail>(`/api/admin/courses/${id}/`);
  },
  updateCourse(id: number, data: Partial<DashboardCourse>) {
    return axiosClient.patch<DashboardCourse>(
      `/api/admin/courses/${id}/`,
      data
    );
  },
  getAllCourses() {
    return axiosClient.get<DashboardCourse[]>("/api/admin/courses/");
  },

  getTrainees(courseId: number) {
    return axiosClient.get<User[]>(`/api/admin/courses/${courseId}/trainees/`);
  },
  addTrainees(courseId: number, traineeIds: number[]) {
    return axiosClient.post(`/api/admin/courses/${courseId}/add-trainees/`, {
      trainee_ids: traineeIds,
    });
  },
  removeTrainee(courseId: number, traineeId: number) {
    return axiosClient.delete(
      `/api/admin/courses/${courseId}/remove-trainee/`,
      { data: { id: traineeId } }
    );
  },
  addSupervisors(courseId: number, supervisorIds: number[]) {
    return axiosClient.post(`/api/admin/courses/${courseId}/add-supervisors/`, {
      supervisor_ids: supervisorIds,
    });
  },
  removeSupervisor(courseId: number, supervisorId: number) {
    return axiosClient.delete(
      `/api/admin/courses/${courseId}/remove-supervisor/`,
      { data: { id: supervisorId } }
    );
  },

  getAllSubjects(params?: { search?: string }) {
    return axiosClient.get<Subject[]>("/api/admin/subjects/", { params });
  },

  addSubject(courseId: number, data: any) {
    return axiosClient.post(
      `/api/admin/courses/${courseId}/add-subject/`,
      data
    );
  },

  getCourseSubjects(courseId: number) {
    return axiosClient.get<AdminCourseSubject[]>(
      `/api/admin/courses/${courseId}/subjects/`
    );
  },

  updateCourseSubject(id: number, data: any) {
    return axiosClient.patch(`/api/admin/course-subjects/${id}/`, data);
  },

  removeSubject(courseId: number, courseSubjectId: number) {
    return axiosClient.delete(
      `/api/admin/courses/${courseId}/remove-subject/`,
      { data: { id: courseSubjectId } }
    );
  },

  reorderSubjects(courseId: number, items: { id: number; position: number }[]) {
    return axiosClient.post(
      `/api/admin/courses/${courseId}/reorder-subjects/`,
      { items }
    );
  },

  addTask(courseId: number, courseSubjectId: number, taskName: string) {
    return axiosClient.post(`/api/admin/courses/${courseId}/add-task/`, {
      course_subject_id: courseSubjectId,
      name: taskName,
    });
  },

  createCourse(payload: CreateCoursePayload) {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("start_date", payload.start_date);
    formData.append("finish_date", payload.finish_date);

    if (payload.link_to_course) {
      formData.append("link_to_course", payload.link_to_course);
    }

    if (payload.status !== undefined) {
      formData.append("status", payload.status.toString());
    }

    if (payload.image) {
      formData.append("image", payload.image);
    }

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

    if (payload.categories && payload.categories.length > 0) {
      payload.categories.forEach((id) => {
        formData.append("categories", id.toString()); 
      });
    }

    return axiosClient.post<DashboardCourse>(
      "/api/admin/courses/create/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  getAllCategories() {
    return axiosClient.get<Category[]>("/api/admin/categories/"); // Giả sử bạn đã có API này
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

  async getStats(): Promise<DashboardStats> {
    try {
      const res = await axiosClient.get<any>("/api/admin/stats/");
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
};
