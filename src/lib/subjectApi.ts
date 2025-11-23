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
    return axiosClient.post(`/api/supervisor/subjects/${subjectId}/tasks/`, {
      name: taskName,
    });
  },

  toggleTask(taskId: number, status: TaskStatus) {
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
    return axiosClient.patch(
      `/api/supervisor/user-subjects/${userSubjectId}/assessment/`,
      {
        score: score,
        supervisor_comment: comment,
      }
    );
  },
};
