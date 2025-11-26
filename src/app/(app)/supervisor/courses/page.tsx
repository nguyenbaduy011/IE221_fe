/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2, BookOpen } from "lucide-react"; // Bỏ icon Plus
import { DashboardCourse } from "@/types/course";
import { supervisorApi } from "@/lib/supervisorApi"; // Đảm bảo đã có file này
import { CourseDataTable } from "./course-data-table"; // Import Table từ Admin (tái sử dụng)
import { getSupervisorColumns } from "./supervisor-course-columns"; // Import columns vừa tạo ở trên

export default function SupervisorCourseManagementPage() {
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      // 1. Gọi API lấy khóa học CỦA TÔI
      const response = await supervisorApi.getMyCourses();

      // 2. Xử lý dữ liệu trả về an toàn
      const payload = (response as any).data || response;
      let data: DashboardCourse[] = [];

      if (Array.isArray(payload)) {
        data = payload;
      } else if (payload && Array.isArray(payload.data)) {
        data = payload.data;
      } else if (payload && Array.isArray(payload.results)) {
        data = payload.results;
      }

      setCourses(data);
    } catch (error) {
      console.error("Failed to load supervisor courses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading your assigned courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            My Courses
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage the courses you are assigned to supervise.
          </p>
        </div>

        {/* ĐÃ ẨN NÚT TẠO KHÓA HỌC Ở ĐÂY */}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">
            Assigned Courses ({courses.length})
          </h2>
        </div>
        <div className="p-6">
          {/* Truyền columns dành riêng cho Supervisor */}
          <CourseDataTable columns={getSupervisorColumns} data={courses} />
        </div>
      </div>
    </div>
  );
}
