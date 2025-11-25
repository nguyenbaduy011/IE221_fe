"use client";

import React, { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  GraduationCap,
} from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";

interface CourseListResponse extends Course {
  progress?: number;
  student_count?: number;
  subject_count?: number;
}

const ITEMS_PER_PAGE = 8;

export default function TraineeMyCoursesPage() {
  const [courses, setCourses] = useState<CourseListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosClient.get("api/trainee/courses/");

        const dataList = res.data.data || res.data;

        if (Array.isArray(dataList)) {
          setCourses(dataList);
        } else {
          console.warn("API response is not an array:", dataList);
          setCourses([]);
        }
      } catch (error) {
        console.error("Fetch courses error:", error);
        toast.error("Failed to load courses list.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCourses = courses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto px-6 py-10 space-y-8 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col space-y-1 border-b border-border pb-5">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          My Enrolled Courses
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track your active courses, progress, and upcoming tasks.
        </p>
      </div>

      {/* CONTENT SECTION */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-2 items-center pt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-1 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="hidden sm:flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "default" : "ghost"}
                      onClick={() => handlePageClick(page)}
                      className={`w-9 h-9 p-0 ${
                        currentPage === page
                          ? "pointer-events-none shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <span className="sm:hidden text-sm text-muted-foreground mx-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-xl border border-dashed border-border shadow-sm">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <FolderOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            No courses found
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs text-center">
            You are not currently enrolled in any courses. Check back later or
            contact your supervisor.
          </p>
        </div>
      )}
    </div>
  );
}
