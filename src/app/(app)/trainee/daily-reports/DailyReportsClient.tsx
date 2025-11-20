"use client";

import { useState, useEffect, useCallback } from "react";
import DailyReportsFilter from "./DailyReportsFilter";
import DailyReportsList from "./DailyReportsList";
import { DailyReport } from "@/types/dailyReport";
import { Course } from "@/types/course";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";

interface DailyReportApi {
  id: number;
  user: number;
  user_name?: string;
  course: number;
  course_name?: string;
  content: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  courseId: number | null;
  date: string;
}

const ITEMS_PER_PAGE = 5;

export default function DailyReportsClient() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filter, setFilter] = useState<FilterState>({
    courseId: null,
    date: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosClient.get("api/trainee/courses/");
        setAvailableCourses(res.data.data || res.data);
      } catch (error) {
        console.error("Fetch courses error:", error);
        toast.error("Failed to load courses list.");
      }
    };
    fetchCourses();
  }, []);

  const mapApiToDailyReport = (r: DailyReportApi): DailyReport => ({
    ...r,
    user: { id: r.user, name: r.user_name || "Unknown" },
    course: { id: r.course, name: r.course_name || "Unknown" },
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);

    try {
      const query = new URLSearchParams();
      if (filter.courseId) query.append("course_id", String(filter.courseId));
      if (filter.date) query.append("filter_date", filter.date);

      const res = await axiosClient.get(
        `api/trainee/daily_reports/?${query.toString()}`
      );

      const list = (
        Array.isArray(res.data) ? res.data : res.data.data || []
      ).map(mapApiToDailyReport);

      setReports(list);
    } catch (error) {
      console.error("Fetch reports error:", error);
      toast.error("Failed to fetch daily reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFilterChange = (newFilter: FilterState) => {
    setFilter(newFilter);
  };

  const totalItems = reports.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReports = reports.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
        Daily Reports Management
      </h1>

      <DailyReportsFilter
        courses={availableCourses}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
      />

      <DailyReportsList
        reports={paginatedReports}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onRefresh={fetchReports}
      />
    </div>
  );
}
