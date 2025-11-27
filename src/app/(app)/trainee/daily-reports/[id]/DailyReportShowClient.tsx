"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { DailyReport, DailyReportStatus } from "@/types/dailyReport";
import { toast } from "sonner";
import { ArrowLeft, Calendar, BookOpen, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DailyReportShowClient({ id }: { id: string }) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosClient.get(`api/trainee/daily_reports/${id}/`);
        const data = res.data.data || res.data;

        setReport({
          ...data,
          course: { id: data.course, name: data.course_name || "Unknown" },
          user: { id: data.user, name: data.user_name || "Unknown" },
        });
      } catch {
        toast.error("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">
          Report not found
        </h2>
        <Link
          href="/trainee/daily-reports"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/trainee/daily-reports">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent hover:text-primary cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            report.status === DailyReportStatus.Submitted
              ? "bg-primary/10 text-primary" 
              : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" 
          }`}
        >
          {report.status === DailyReportStatus.Submitted
            ? "Submitted"
            : "Draft"}
        </div>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Daily Report Details
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium mr-2 text-foreground">Course:</span>
              {report.course.name}
            </div>

            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium mr-2 text-foreground">Date:</span>
              {new Date(report.created_at).toLocaleDateString()}
            </div>

            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2 text-purple-500" />
              <span className="font-medium mr-2 text-foreground">
                Last Updated:
              </span>
              {new Date(report.updated_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Report Content
          </h3>
          <div className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {report.content}
          </div>
        </div>
      </div>
    </div>
  );
}
