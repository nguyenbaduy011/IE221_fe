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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {detail.subject_name}
          </h3>
          <p className="text-sm text-gray-500">
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
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
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
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
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
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default"
              disabled
            >
              Finished
            </Button>
          ) : (
            <Button
              className={`w-full ${
                unfinishedTasksCount > 0
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
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
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You still have{" "}
              <span className="font-bold text-red-500">
                {unfinishedTasksCount}
              </span>{" "}
              incomplete task(s). Please confirm the completion of the course.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={submitFinish} disabled={loading}>
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
