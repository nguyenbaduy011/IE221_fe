"use client";

import React, { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 bg-background min-h-screen">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            My Courses
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track your learning progress.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <div className="p-2 space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex flex-wrap justify-center gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
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
                          ? "pointer-events-none shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <span className="sm:hidden text-sm text-muted-foreground mx-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-xl border border-dashed border-border">
          <div className="p-4 bg-background rounded-full mb-4 shadow-sm border border-border">
            <FolderOpen className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            No courses found
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs text-center">
            You haven&apos;t enrolled in any courses yet.
          </p>
        </div>
      )}
    </div>
  );
}
