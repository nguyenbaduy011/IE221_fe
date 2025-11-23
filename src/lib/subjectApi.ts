import axiosClient from "./axiosClient";
import { SubjectDetail, Task } from "@/types/subject";

// Định nghĩa lại Payload để đảm bảo Type Safety
export interface UpdateDatePayload {
  actual_start_day?: string;
  actual_end_day?: string;
}

export const subjectApi = {
  // GET /api/users/my-course-subjects/{id}/
  // Backend trả về trực tiếp object SubjectDetail
  getDetail(id: number) {
    return axiosClient.get<SubjectDetail>(`/api/users/my-course-subjects/${id}/`);
  },

  // PATCH /api/users/user-tasks/{id}/
  // Endpoint này thuộc UserTaskViewSet
  updateTask(taskId: number, data: FormData) {
    return axiosClient.patch<Task>(
      `/api/users/user-tasks/${taskId}/`,
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  // PATCH /api/users/my-course-subjects/{id}/
  updateSubjectDates(id: number, data: UpdateDatePayload) {
    return axiosClient.patch<SubjectDetail>(
      `/api/users/my-course-subjects/${id}/`,
      data
    );
  },

  // POST /api/users/my-course-subjects/{id}/finish_subject/
  finishSubject(id: number) {
    return axiosClient.post<SubjectDetail>(
      `/api/users/my-course-subjects/${id}/finish_subject/`
    );
  },
};