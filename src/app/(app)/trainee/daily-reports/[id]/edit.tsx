"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DailyReportForm, { DailyReportFormData } from "../DailyReportForm";
import axiosClient from "@/lib/axiosClient";
import { Course } from "@/types/course";
import { DailyReport, DailyReportStatus } from "@/types/dailyReport";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditDailyReportPage({
  params,
}: {
  params: { id: string };
}) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, courseRes] = await Promise.all([
          axiosClient.get(`api/trainee/daily_reports/${params.id}/`),
          axiosClient.get("api/trainee/courses/"),
        ]);

        const reportData = reportRes.data.data || reportRes.data;

        if (reportData.status === DailyReportStatus.Submitted) {
          toast.error("Cannot edit a submitted report");
          router.push("/trainee/daily-reports");
          return;
        }

        setReport({
          ...reportData,
          course: {
            id: reportData.course,
            name: reportData.course_name || "Unknown",
          },
        });
        setCourses(courseRes.data.data || courseRes.data);
      } catch {
        toast.error("Failed to load data");
        router.push("/trainee/daily-reports");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  const handleSubmit = async (data: DailyReportFormData) => {
    setSaving(true);
    try {
      await axiosClient.put(`api/trainee/daily_reports/${params.id}/`, {
        course_id: data.courseId,
        content: data.content,
        status: data.status,
      });

      toast.success("Report updated successfully");
      router.push("/trainee/daily-reports");
    } catch {
      toast.error("Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
          Edit Daily Report #{params.id}
        </h1>
      </div>

      {report && (
        <DailyReportForm
          dailyReport={report}
          courses={courses}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  );
}
