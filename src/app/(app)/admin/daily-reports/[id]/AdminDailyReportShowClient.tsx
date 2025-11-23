"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { DailyReport } from "@/types/dailyReport";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Clock,
  Loader2,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminDailyReportShowClient({ id }: { id: string }) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosClient.get(`api/admin/daily_reports/${id}/`);
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
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <FileText className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Report not found
        </h2>
        <Link href="/admin/daily-reports">
          <Button variant="link" className="mt-2 text-primary">
            Return to list
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/admin/daily-reports">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>

      {/* Report Card */}
      <Card className="overflow-hidden shadow-md">
        <CardHeader className="bg-muted/30 border-b border-border pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Daily Report #{report.id}
              </p>
              <CardTitle className="text-2xl font-bold text-foreground">
                Trainee Report Details
              </CardTitle>
            </div>
            <div className="bg-background border border-border px-3 py-1.5 rounded-md shadow-sm flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {new Date(report.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Meta Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 p-6 md:p-8 bg-card">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Course
              </label>
              <p className="text-base font-medium text-foreground pl-6">
                {report.course.name}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Sender
              </label>
              <p className="text-base font-medium text-foreground pl-6">
                {report.user.name}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Last Updated
              </label>
              <p className="text-base font-medium text-foreground pl-6">
                {new Date(report.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Content Section */}
          <div className="p-6 md:p-8 bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Report Content
            </h3>
            <div className="prose dark:prose-invert max-w-none text-foreground whitespace-pre-wrap leading-relaxed bg-background border border-border p-4 rounded-lg shadow-sm">
              {report.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
