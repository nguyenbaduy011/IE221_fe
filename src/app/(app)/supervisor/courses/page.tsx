/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2, BookOpen, Plus } from "lucide-react"; // Import thêm icon Plus
import { Button } from "@/components/ui/button"; // Import Button component
import Link from "next/link"; // Import Link component
import { DashboardCourse } from "@/types/course";
import { supervisorApi } from "@/lib/supervisorApi";
import { CourseDataTable } from "./course-data-table";
import { getSupervisorColumns } from "./supervisor-course-columns";

export default function SupervisorCourseManagementPage() {
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await supervisorApi.getMyCourses();

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

        <Button asChild className="shrink-0 shadow-sm">
          <Link href="/supervisor/courses/create">
            <Plus className="w-5 h-5 mr-2" />
            Create New Course
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">
            Assigned Courses ({courses.length})
          </h2>
        </div>
        <div className="p-6">
          <CourseDataTable columns={getSupervisorColumns} data={courses} />
        </div>
      </div>
    </div>
  );
}
