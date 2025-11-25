/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "@/lib/axiosClient";
import { CourseDetailResponse } from "@/types/courseDetail";
import { UserRole } from "@/types/course";

const getPrefix = (role: UserRole) =>
  role === "ADMIN" ? "/api/admin" : "/api/supervisor";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const courseApi = {
  getTraineeCourseDetail(courseId: string | number) {
    return axiosClient.get<ApiResponse<CourseDetailResponse>>(
      `/api/trainee/courses/${courseId}/detail/`
    );
  },
  
  getDetail(id: number, role: UserRole) {
    return axiosClient.get(`${getPrefix(role)}/courses/${id}/`);
  },

  updateCourse(id: number, data: any, role: UserRole) {
    return axiosClient.patch(`${getPrefix(role)}/courses/${id}/update/`, data);
  },

  getTrainees(id: number, role: UserRole) {
    return role === "ADMIN"
      ? axiosClient.get(`${getPrefix(role)}/courses/${id}/trainees/`)
      : axiosClient.get(`${getPrefix(role)}/courses/${id}/students/`);
  },

  addTrainees(id: number, ids: number[], role: UserRole) {
    return axiosClient.post(`${getPrefix(role)}/courses/${id}/add-trainees/`, {
      trainee_ids: ids,
    });
  },

  removeTrainee(id: number, userId: number, role: UserRole) {
    return axiosClient.delete(
      `${getPrefix(role)}/courses/${id}/remove-trainee/`,
      {
        data: { id: userId },
      }
    );
  },

  addSupervisors(id: number, ids: number[], role: UserRole) {
    return axiosClient.post(
      `${getPrefix(role)}/courses/${id}/add-supervisors/`,
      {
        supervisor_ids: ids,
      }
    );
  },

  removeSupervisor(id: number, userId: number, role: UserRole) {
    return axiosClient.delete(
      `${getPrefix(role)}/courses/${id}/remove-supervisor/`,
      {
        data: { id: userId },
      }
    );
  },

  getSubjects(id: number, role: UserRole) {
    return axiosClient.get(`${getPrefix(role)}/courses/${id}/subjects/`);
  },

  addSubject(id: number, data: any, role: UserRole) {
    return axiosClient.post(
      `${getPrefix(role)}/courses/${id}/add-subject/`,
      data
    );
  },

  removeSubject(id: number, subId: number, role: UserRole) {
    return axiosClient.delete(
      `${getPrefix(role)}/courses/${id}/remove-subject/`,
      {
        data: { id: subId },
      }
    );
  },

  updateCourseSubject(id: number, data: any) {
    return axiosClient.patch(`/api/admin/course-subjects/${id}/`, data);
  },

  reorderSubjects(id: number, items: any, role: UserRole) {
    return axiosClient.post(
      `${getPrefix(role)}/courses/${id}/reorder-subjects/`,
      { items }
    );
  },

  addTask(id: number, csId: number, name: string, role: UserRole) {
    return axiosClient.post(`${getPrefix(role)}/courses/${id}/add-task/`, {
      course_subject_id: csId,
      name,
    });
  },

  updateTask(taskId: number, name: string, role: UserRole) {
    return axiosClient.patch(`${getPrefix(role)}/tasks/${taskId}/detail/`, {
      name,
    });
  },

  deleteTask(taskId: number, role: UserRole) {
    return axiosClient.delete(`${getPrefix(role)}/tasks/${taskId}/detail/`);
  },
};
