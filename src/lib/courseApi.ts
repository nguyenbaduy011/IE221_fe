import axiosClient from "@/lib/axiosClient";
import { CourseDetailResponse } from "@/types/courseDetail";

// src/lib/api/courseApi.ts

// Định nghĩa wrapper
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const courseApi = {
  getTraineeCourseDetail(courseId: string | number) {
    // Báo cho axios biết res.data sẽ có dạng ApiResponse
    return axiosClient.get<ApiResponse<CourseDetailResponse>>(
      `/api/trainee/courses/${courseId}/detail/`
    );
  },
};
