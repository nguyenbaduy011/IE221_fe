"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCourse } from "@/types/course";
import { adminApi } from "@/lib/adminApi";
// Import thêm supervisorApi hoặc axiosClient để gọi my-courses
import { supervisorApi } from "@/lib/supervisorApi";
import axiosClient from "@/lib/axiosClient";
import Link from "next/link";
import { CourseDataTable } from "./course-data-table";
import { getAdminColumns } from "./admin-course-columns";

export default function AdminCourseManagementPage() {
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"ADMIN" | "SUPERVISOR" | null>(null);

  // 1. Lấy Role
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axiosClient.get("/auth/me/");
        const user = (res.data as any).data || res.data;
        setRole(user.role);
      } catch (error) {
        console.error("Failed to fetch role");
      }
    };
    fetchRole();
  }, []);

  // 2. Fetch Courses dựa trên Role
  const fetchCourses = async () => {
    if (!role) return; // Chờ role load xong
    try {
      setLoading(true);

      let response;
      if (role === "ADMIN") {
        response = await adminApi.getAllCourses();
      } else {
        // Supervisor: Gọi my-courses
        response = await supervisorApi.getMyCourses();
      }

      const payload = (response as any).data || response;

      if (payload && Array.isArray(payload.data)) {
        setCourses(payload.data);
      } else if (Array.isArray(payload)) {
        setCourses(payload);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [role]); // Chạy khi role thay đổi

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Layers className="w-8 h-8 text-primary" />
              {role === "ADMIN" ? "Course Management" : "My Courses"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {role === "ADMIN"
                ? "System-wide overview and management of all training courses."
                : "Overview and management of courses you supervise."}
            </p>
          </div>

          {/* Chỉ Admin mới thấy nút Create */}
          {role === "ADMIN" && (
            <Button asChild className="shrink-0 shadow-sm">
              <Link href="/admin/courses/create">
                <Plus className="w-5 h-5 mr-2" />
                Create New Course
              </Link>
            </Button>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <h2 className="text-lg font-semibold text-foreground">
              {role === "ADMIN"
                ? "All Courses Directory"
                : "Your Supervised Courses"}{" "}
              ({courses.length})
            </h2>
          </div>
          <div className="p-6">
            <CourseDataTable columns={getAdminColumns} data={courses} />
          </div>
        </div>
      </div>
    </div>
  );
}
