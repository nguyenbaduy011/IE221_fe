"use client";

import React, { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"; 
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";

interface CourseListResponse extends Course {
  progress?: number;
  student_count?: number;
  subject_count?: number;
}

const ITEMS_PER_PAGE = 4;

export default function TraineeMyCoursesPage() {
  const [courses, setCourses] = useState<CourseListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho phân trang
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

  // --- Logic Phân trang ---
  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  
  // Lấy danh sách course cho trang hiện tại
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
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Khóa học của tôi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Quản lý và theo dõi tiến độ học tập của bạn.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <>
          {/* Course Grid - Render currentCourses thay vì courses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination Control */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2 items-center">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </Button>

              {/* Tạo danh sách số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </Button>
              ))}

              <Button 
                variant="outline" 
                onClick={handleNext} 
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-full mb-3 shadow-sm">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Không có dữ liệu để hiển thị
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Bạn chưa tham gia khóa học nào.
          </p>
        </div>
      )}
    </div>
  );
}