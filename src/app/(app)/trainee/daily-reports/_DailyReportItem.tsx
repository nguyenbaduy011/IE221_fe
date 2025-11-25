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
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  dailyReport: DailyReport;
  onRefresh: () => void;
};

export default function DailyReportItem({ dailyReport, onRefresh }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const isDraft = dailyReport.status === DailyReportStatus.Draft;

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosClient.delete(`api/trainee/daily_reports/${dailyReport.id}/`);
      toast.success("Report deleted successfully");
      setIsDeleteModalOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axiosClient.patch(`api/trainee/daily_reports/${dailyReport.id}/`, {
        status: DailyReportStatus.Submitted,
      });

      toast.success("Report submitted successfully");
      setIsSubmitModalOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-3">
          <h6 className="font-bold text-lg text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Daily Report #{dailyReport.id}
          </h6>
          <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(dailyReport.updated_at).toLocaleString()}
          </div>
        </div>

        <div className="space-y-2 text-sm text-foreground/80">
          <p className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-semibold mr-1">Course:</span>
            {dailyReport.course.name}
          </p>

          <p className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-semibold mr-1">Sender:</span>
            {dailyReport.user.name}
          </p>

          <div className="mt-3 bg-muted/30 p-3 rounded-lg border border-border">
            <p className="text-muted-foreground italic">
              &quot;
              {dailyReport.content.length > 100
                ? dailyReport.content.substring(0, 100) + "..."
                : dailyReport.content}
              &quot;
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
          {isDraft ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
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
                size="sm"
                onClick={() => setIsSubmitModalOpen(true)}
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

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Delete Report
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Send className="w-5 h-5" /> Submit Report
            </DialogTitle>
            <DialogDescription>
              Once submitted, you cannot edit this report anymore. Are you sure
              you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
