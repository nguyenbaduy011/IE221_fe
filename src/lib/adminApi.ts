import axiosClient from "@/lib/axiosClient";
import { DashboardCourse } from "@/types/course";

export const adminApi = {
  /**
   * Lấy tất cả khóa học trong hệ thống (Dành cho Admin)
   * Endpoint này dựa trên code Django: path("admin/courses/", AdminCourseListView.as_view())
   */
  async getAllCourses() {
    // Giả sử API trả về mảng trực tiếp hoặc bọc trong { data: [...] }
    const response = await axiosClient.get<DashboardCourse[] | { data: DashboardCourse[] }>("/api/admin/courses/");

    if ('data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    } else if (Array.isArray(response.data)) {
        return response.data;
    }
    return [];
  },

  // Sau này bạn sẽ thêm các hàm khác như:
  // createCourse(data: any) { ... }
  // deleteCourse(id: number) { ... }
};