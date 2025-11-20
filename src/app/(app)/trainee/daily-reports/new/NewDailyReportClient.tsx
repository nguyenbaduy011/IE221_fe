"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DailyReportForm, { DailyReportFormData } from "../DailyReportForm";
import axiosClient from "@/lib/axiosClient";
import { Course } from "@/types/course";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AxiosError } from "axios";

export default function NewDailyReportClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosClient.get("api/trainee/courses/");
        setCourses(res.data.data || res.data);
      } catch {
        toast.error("Failed to load courses");
      }
    };
    fetchCourses();
  }, []);

  interface ErrorResponseData {
    course?: string[];
    detail?: string;
  }

  const handleSubmit = async (data: DailyReportFormData) => {
    setLoading(true);
    try {
      await axiosClient.post("api/trainee/daily_reports/", {
        course: data.courseId,
        content: data.content,
        status: data.status,
      });

      toast.success(
        data.status === 1
          ? "Report submitted successfully"
          : "Draft saved successfully"
      );
      router.push("/trainee/daily-reports");
    } catch (error) {
      let errorMsg = "Failed to create report";

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as ErrorResponseData;


        errorMsg =
          responseData?.course?.[0] || responseData?.detail || errorMsg;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/trainee/daily-reports"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Daily Report
        </h1>
      </div>

      <DailyReportForm
        courses={courses}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
