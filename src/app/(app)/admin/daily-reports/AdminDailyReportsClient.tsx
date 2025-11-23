"use client";

import { useState, useEffect, useCallback } from "react";
import AdminDailyReportsFilter from "./AdminDailyReportsFilter";
import AdminDailyReportsList from "./AdminDailyReportsLists";
import { DailyReport } from "@/types/dailyReport";
import { Course } from "@/types/course";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import { Users } from "lucide-react";

export interface FilterState {
  courseId: number | null;
  date: string;
}

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

const ITEMS_PER_PAGE = 5;

export default function AdminDailyReportsClient() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filter, setFilter] = useState<FilterState>({
    courseId: null,
    date: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosClient.get("api/admin/courses/");
        setCourses(res.data.data || res.data);
      } catch {
        toast.error("Failed to load supervised courses");
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
        `api/admin/daily_reports/?${query.toString()}`
      );

      const list = (
        Array.isArray(res.data) ? res.data : res.data.data || []
      ).map(mapApiToDailyReport);

      setReports(list);
    } catch {
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
    <div className="container mx-auto px-4 py-8 space-y-8 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Trainee Daily Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and review daily progress submitted by trainees across all
            courses.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <AdminDailyReportsFilter
        courses={courses}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
      />

      {/* List Section */}
      <AdminDailyReportsList
        reports={paginatedReports}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
