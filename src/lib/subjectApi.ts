// src/lib/subjectApi.ts
import { TaskStatus, Trainee } from "@/types/subjectDetails";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./userApi"; 
import { SubjectDetail, Task } from "@/types/subject";

export const subjectApi = {
  getClassmates(courseId: string) {
    return axiosClient.get<Trainee[]>(
      `/api/supervisor/courses/${courseId}/students/`
    );
  },

  getDetail(id: number) {
    return axiosClient.get<ApiResponse<SubjectDetail>>(
      `/api/users/my-course-subjects/${id}/`
    );
  },

  getStudentSubjectDetail(subjectId: string, studentId: number) {
    return axiosClient.get<{ data: SubjectDetail }>(
      `/api/supervisor/subjects/${subjectId}/student/${studentId}/`
    );
  },

  // --- Thêm task cho subject ---
  addTask(subjectId: string, taskName: string) {
    return axiosClient.post(`/api/supervisor/subjects/${subjectId}/tasks/`, {
      name: taskName,
    });
  },

  // --- Thay đổi trạng thái task ---
  toggleTask(taskId: number, status: TaskStatus) {
    return axiosClient.patch(`/api/supervisor/tasks/${taskId}/`, {
      status: status,
    });
  },

  updateTask(taskId: number, data: FormData) {
    return axiosClient.patch<ApiResponse<Task>>(
      `/api/users/user-tasks/${taskId}/`,
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  updateSubjectDates(
    id: number,
    data: { actual_start_day?: string; actual_end_day?: string }
  ) {
    return axiosClient.patch<ApiResponse<SubjectDetail>>(
      `/api/users/my-course-subjects/${id}/`,
      data
    );
  },

  saveAssessment(userSubjectId: number, score: number, comment: string) {
    return axiosClient.patch(
      `/api/supervisor/user-subjects/${userSubjectId}/assessment/`,
      {
        score: score,
        supervisor_comment: comment,
      }
    );
  },

  completeSubject(userSubjectId: number) {
    return axiosClient.post(
      `/api/supervisor/user-subjects/${userSubjectId}/complete/`
    );
  },

  finishSubject(id: number) {
    return axiosClient.post<ApiResponse<SubjectDetail>>(
      `/api/users/my-course-subjects/${id}/finish_subject/`
    );
  },
};
