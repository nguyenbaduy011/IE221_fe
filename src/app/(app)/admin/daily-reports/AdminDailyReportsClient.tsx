"use client";

import { useState, useEffect, useCallback } from "react";
import AdminDailyReportsFilter from "./AdminDailyReportsFilter";
import AdminDailyReportsList from "./AdminDailyReportsLists";
import { DailyReport } from "@/types/dailyReport";
import { Course } from "@/types/course";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import { ClipboardList, Loader2, Filter } from "lucide-react";

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
  const [loading, setLoading] = useState(true); 
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

  if (loading && reports.length === 0 && courses.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading daily reports...
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
            <ClipboardList className="w-8 h-8 text-primary" />
            Trainee Daily Reports
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Monitor progress and review daily submissions from all trainees.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          Filter Options
        </div>
        <AdminDailyReportsFilter
          courses={courses}
          currentFilter={filter}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            Report Submissions ({reports.length})
          </h2>
        </div>
        <div className="p-6">
          <AdminDailyReportsList
            reports={paginatedReports}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        </div>
      </div>
    </div>
  );
}
