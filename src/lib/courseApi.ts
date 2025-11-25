import axiosClient from "@/lib/axiosClient";
import { CourseDetailResponse } from "@/types/courseDetail";

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
};
