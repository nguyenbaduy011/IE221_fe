"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubjectDetail, SubjectStatus, TaskStatus } from "@/types/subject";
import { format } from "date-fns";
import { toast } from "sonner";
import { subjectApi } from "@/lib/subjectApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  detail: SubjectDetail;
  onRefresh: () => void;
  courseSubjectId: number;
};

export default function CompletionBox({
  detail,
  onRefresh,
  courseSubjectId,
}: Props) {
  const [actualStart, setActualStart] = useState(
    detail.actual_start_day
      ? format(new Date(detail.actual_start_day), "yyyy-MM-dd")
      : ""
  );
  const [actualEnd, setActualEnd] = useState(
    detail.actual_end_day
      ? format(new Date(detail.actual_end_day), "yyyy-MM-dd")
      : ""
  );

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dayText = detail.estimated_time_days > 1 ? "days" : "day";

  const isFinished = [
    SubjectStatus.FINISHED_EARLY,
    SubjectStatus.FINISHED_ON_TIME,
    SubjectStatus.FINISHED_BUT_OVERDUE,
    SubjectStatus.OVERDUE_AND_NOT_FINISHED,
  ].includes(detail.status);

  const unfinishedTasksCount = detail.tasks.filter(
    (t) => t.status === TaskStatus.NOT_DONE
  ).length;

  const handleDateBlur = async () => {
    if (!actualStart && !actualEnd) return;

    try {
      await subjectApi.updateSubjectDates(courseSubjectId, {
        actual_start_day: actualStart || undefined,
        actual_end_day: actualEnd || undefined,
      });
    } catch {}
  };

  const handleFinishClick = () => {
    if (!actualStart) return toast.error("Actual start date can not be blank");
    if (!actualEnd) return toast.error("Actual end date can not be blank");

    if (new Date(actualEnd) < new Date(actualStart)) {
      return toast.error(
        "Actual end date must be greater than or equal to start date"
      );
    }

    if (unfinishedTasksCount > 0) {
      setIsConfirmOpen(true);
    } else {
      submitFinish();
    }
  };

  const submitFinish = async () => {
    setLoading(true);
    try {
      await subjectApi.updateSubjectDates(courseSubjectId, {
        actual_start_day: actualStart,
        actual_end_day: actualEnd,
      });

      await subjectApi.finishSubject(courseSubjectId);
      toast.success("Subject completed successfully!");
      setIsConfirmOpen(false);
      onRefresh();
    } catch {
      toast.error("Failed to finish subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Container: bg-card, text-card-foreground */}
      <div className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {detail.subject_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            (Time: {detail.estimated_time_days} {dayText})
          </p>
        </div>

        {/* Date Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Start at:{" "}
              <span className="font-normal">
                {format(new Date(detail.start_date), "dd/MM/yyyy")}
              </span>
            </p>
            <p className="text-sm font-medium">
              Deadline:{" "}
              <span className="font-normal">
                {format(new Date(detail.deadline), "dd/MM/yyyy")}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Actual start day
              </label>
              <Input
                type="date"
                value={actualStart}
                onChange={(e) => setActualStart(e.target.value)}
                onBlur={handleDateBlur}
                disabled={isFinished}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Actual end day
              </label>
              <Input
                type="date"
                value={actualEnd}
                onChange={(e) => setActualEnd(e.target.value)}
                onBlur={handleDateBlur}
                disabled={isFinished}
              />
            </div>
          </div>
        </div>

        {/* Finish Button */}
        <div className="pt-2">
          {isFinished ? (
            // Finished State: Success style nhẹ nhàng
            <Button
              variant="outline"
              className="cursor-pointer w-full border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 opacity-100 disabled:opacity-100"
              disabled
            >
              Finished
            </Button>
          ) : (
            // Action Button
            <Button
              className={`w-full cursor-pointer ${
                unfinishedTasksCount > 0
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-700 dark:hover:bg-yellow-800" // Warning state
                  : ""
              }`}
              variant={unfinishedTasksCount > 0 ? "default" : "default"} // Dùng default variant để lấy style gốc, sau đó override màu nếu cần
              onClick={handleFinishClick}
              disabled={loading}
            >
              {unfinishedTasksCount > 0 ? "Inprogress" : "Finish"}
            </Button>
          )}
        </div>
      </div>

      {/* CONFIRM POPUP */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Subject finish confirm
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You still have{" "}
              <span className="font-bold text-destructive">
                {unfinishedTasksCount}
              </span>{" "}
              incomplete task(s). Please confirm the completion of the course.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={submitFinish}
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
