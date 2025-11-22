/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "@/lib/axiosClient";
import { Course, DashboardStats } from "@/types/course";

export const supervisorApi = {
  getMyCourses() {
    return axiosClient.get<any>("/api/supervisor/courses/my-courses/");
  },

  async getStats(): Promise<DashboardStats> {
    try {
      // Gọi API thống kê THẬT từ backend
      const res = await axiosClient.get<any>("/api/supervisor/stats/");

      // Xử lý dữ liệu trả về (hỗ trợ cả dạng bọc data hoặc không)
      const statsData = res.data?.data || res.data;

      return {
        total_supervisors: statsData.total_supervisors || 0,
        total_trainees: statsData.total_trainees || 0,
        active_courses: statsData.active_courses || 0,
        completion_rate: statsData.completion_rate || 0,
      };
    } catch (error) {
      console.error("Error fetching stats from backend", error);
      // Fallback về 0 nếu lỗi
      return {
        total_supervisors: 0,
        total_trainees: 0,
        active_courses: 0,
        completion_rate: 0,
      };
    }
  },
};
