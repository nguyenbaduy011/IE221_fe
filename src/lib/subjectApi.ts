// src/lib/subjectApi.ts
import axiosClient from "./axiosClient";
import { ApiResponse } from "./userApi"; // Tái sử dụng interface ApiResponse
import { SubjectDetail, Task } from "@/types/subject";

export const subjectApi = {
  getDetail(id: number) {
    // API lấy chi tiết UserSubject (bao gồm tasks, comments...)
    return axiosClient.get<ApiResponse<SubjectDetail>>(`/api/users/my-course-subjects/${id}/`);
  },

  updateTask(taskId: number, data: FormData) {
    // Dùng FormData để hỗ trợ upload file
    return axiosClient.patch<ApiResponse<Task>>(`/api/users/user-tasks/${taskId}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateSubjectDates(id: number, data: { actual_start_day?: string; actual_end_day?: string }) {
    return axiosClient.patch<ApiResponse<SubjectDetail>>(`/api/users/my-course-subjects/${id}/`, data);
  },

  finishSubject(id: number) {
    return axiosClient.post<ApiResponse<SubjectDetail>>(`/api/users/my-course-subjects/${id}/finish_subject/`);
  }
};