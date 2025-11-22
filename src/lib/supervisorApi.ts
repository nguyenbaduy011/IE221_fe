/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "@/lib/axiosClient";
import { Course, DashboardStats } from "@/types/course";

export const supervisorApi = {
  getMyCourses() {
    return axiosClient.get<any>("/api/supervisor/courses/my-courses/");
  },

  async getStats(): Promise<DashboardStats> {
    try {
      const res = await axiosClient.get<any>("/api/supervisor/stats/");
      const data = res.data?.data || res.data; // Handle wrapper

      return {
        total_supervisors: data.total_supervisors || 0,
        total_trainees: data.total_trainees || 0,
        active_courses: data.active_courses || 0,
        completion_rate: data.completion_rate || 0,
        // Map dữ liệu mảng, nếu không có thì trả về mảng rỗng
        chart_data: Array.isArray(data.chart_data) ? data.chart_data : [],
        recent_activities: Array.isArray(data.recent_activities)
          ? data.recent_activities
          : [],
      };
    } catch (error) {
      console.error("Error fetching stats", error);
      return {
        total_supervisors: 0,
        total_trainees: 0,
        active_courses: 0,
        completion_rate: 0,
        chart_data: [],
        recent_activities: [],
      };
    }
  },
};
