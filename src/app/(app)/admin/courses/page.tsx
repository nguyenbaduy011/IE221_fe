"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCourse } from "@/types/course";
import { adminApi } from "@/lib/adminApi"; // Import API mới

// Import component bảng đã đổi tên và cột mới

import Link from "next/link";
import { CourseDataTable } from "./course-data-table";
import { getAdminColumns } from "./admin-course-columns";

export default function AdminCourseManagementPage() {
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Gọi API của Admin để lấy tất cả khóa học
      const data = await adminApi.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses for admin:", error);
      // Có thể thêm toast notification lỗi ở đây
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading all courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Layers className="w-8 h-8 text-primary" />
              Course Management
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              System-wide overview and management of all training courses.
            </p>
          </div>

          {/* NÚT TẠO KHÓA HỌC (Dành cho Admin) */}
          <Button asChild className="shrink-0 shadow-sm">
            <Link href="/admin/courses/create">
              <Plus className="w-5 h-5 mr-2" />
              Create New Course
            </Link>
          </Button>
        </div>

        {/* TABLE SECTION (Không có Stats) */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <h2 className="text-lg font-semibold text-foreground">
              All Courses Directory ({courses.length})
            </h2>
          </div>
          <div className="p-6">
            {/* Sử dụng bảng chung với cột của admin */}
            <CourseDataTable columns={getAdminColumns} data={courses} />
          </div>
        </div>
      </div>
    </div>
  );
}
