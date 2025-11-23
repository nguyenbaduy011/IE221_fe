import axiosClient from "@/lib/axiosClient";
import { SubjectDetail, TaskStatus, Trainee } from "@/types/subjectDetails";

export const subjectApi = {
  getClassmates(courseId: string) {
    return axiosClient.get<Trainee[]>(
      `/api/supervisor/courses/${courseId}/students/`
    );
  },

  getDetail(subjectId: string, studentId: number) {
    return axiosClient.get<{ data: SubjectDetail }>(
      `/api/supervisor/subjects/${subjectId}/student/${studentId}/`
    );
  },

  addTask(subjectId: string, taskName: string) {
    // Backend yêu cầu { name: string } -> Đã đúng
    return axiosClient.post(`/api/supervisor/subjects/${subjectId}/tasks/`, {
      name: taskName,
    });
  },

  toggleTask(taskId: number, status: TaskStatus) {
    // Backend cần nhận chuỗi "DONE" hoặc "NOT_DONE"
    // Do đã sửa Enum ở bước 1 thành string, nên ở đây gửi thẳng status là đúng
    return axiosClient.patch(`/api/supervisor/tasks/${taskId}/`, {
      status: status,
    });
  },

  completeSubject(userSubjectId: number) {
    return axiosClient.post(
      `/api/supervisor/user-subjects/${userSubjectId}/complete/`
    );
  },

  saveAssessment(userSubjectId: number, score: number, comment: string) {
    // Backend SupervisorUserSubjectAssessmentView nhận "score" và "supervisor_comment"
    return axiosClient.patch(
      `/api/supervisor/user-subjects/${userSubjectId}/assessment/`,
      {
        score: score,
        supervisor_comment: comment,
      }
    );
  },
};
