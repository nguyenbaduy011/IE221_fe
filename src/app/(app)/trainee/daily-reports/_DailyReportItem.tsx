"use client";

import { useState } from "react";
import Link from "next/link";
import { DailyReport, DailyReportStatus } from "@/types/dailyReport";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import {
  BookOpen,
  User,
  FileText,
  Trash2,
  Send,
  Edit,
  Eye,
  Clock,
} from "lucide-react";

type Props = {
  dailyReport: DailyReport;
  onRefresh: () => void;
};

export default function DailyReportItem({ dailyReport, onRefresh }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDraft = dailyReport.status === DailyReportStatus.Draft;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    setIsDeleting(true);
    try {
      await axiosClient.delete(`api/trainee/daily_reports/${dailyReport.id}/`);
      toast.success("Report deleted successfully");
      onRefresh();
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Once submitted, you cannot edit this report. Continue?"))
      return;

    setIsSubmitting(true);
    try {
      await axiosClient.patch(`api/trainee/daily_reports/${dailyReport.id}/`, {
        status: DailyReportStatus.Submitted,
      });

      toast.success("Report submitted successfully");
      onRefresh();
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h6 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Daily Report #{dailyReport.id}
        </h6>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(dailyReport.updated_at).toLocaleString()}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <p className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-semibold mr-1">Course:</span>
          {dailyReport.course.name}
        </p>

        <p className="flex items-center">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-semibold mr-1">Sender:</span>
          {dailyReport.user.name}
        </p>

        <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 italic">
            &quot;
            {dailyReport.content.length > 100
              ? dailyReport.content.substring(0, 100) + "..."
              : dailyReport.content}
            &quot;
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        {isDraft ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </>
              )}
            </Button>

            <Link href={`/trainee/daily-reports/${dailyReport.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting || isSubmitting}
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
            </Link>

            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
              onClick={handleSubmit}
              disabled={isDeleting || isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" /> Submit
                </>
              )}
            </Button>
          </>
        ) : (
          <Link href={`/trainee/daily-reports/${dailyReport.id}`}>
            <Button variant="secondary" size="sm">
              <Eye className="w-4 h-4 mr-1" /> View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
