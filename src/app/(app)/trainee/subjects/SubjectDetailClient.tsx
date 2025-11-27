"use client";

import { useEffect, useState, useCallback } from "react";
import { subjectApi } from "@/lib/subjectApi";
import { SubjectDetail, TaskStatus } from "@/types/subject";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Assessments from "./components/Assessments";
import CompletionBox from "./components/CompletionBox";
import ProgressBar from "./components/ProgressBar";
import StudentInfo from "./components/StudentInfo";
import TaskItem from "./components/TaskItem";

type Props = {
  initialId: number;
};

export default function SubjectDetailClient({ initialId }: Props) {
  const router = useRouter();
  const [detail, setDetail] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!initialId || isNaN(initialId)) {
      setLoading(false);
      return;
    }

    try {
      const response = await subjectApi.getDetail(initialId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = response.data as any;
      const finalData = responseData.data || responseData;

      if (finalData && finalData.id) {
        setDetail(finalData as SubjectDetail);
      } else {
        console.warn("Invalid response format:", finalData);
        toast.error("Subject data error.");
      }
    } catch (error: unknown) {
      console.error("Error fetching subject:", error);
      let msg = "Failed to load subject details.";

      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          msg = "Subject not found.";
        } else if (error.response?.status === 403) {
          msg = "You do not have permission to access this subject.";
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [initialId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-muted-foreground font-medium">
          Loading data...
        </span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          Subject not found
        </h2>
        <p className="text-muted-foreground">
          Subject ID #{initialId} does not exist or you are not enrolled.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  const totalTasks = detail.tasks?.length || 0;
  const completedTasks =
    detail.tasks?.filter((t) => t.status === TaskStatus.DONE).length || 0;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const isFinished = detail.status >= 2;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl animate-in fade-in duration-500">
      {/* Header Info */}
      <StudentInfo
        studentName={detail.student?.name || "N/A"}
        courseName={detail.course?.name || "N/A"}
        courseStart={detail.course?.start_date || ""}
        courseEnd={detail.course?.finish_date || ""}
        courseStatus={detail.course?.status || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress & Task List */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressBar
            subjectName={detail.subject_name}
            percent={progressPercent}
          />

          <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-card-foreground">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Task List</h3>
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{totalTasks} completed
              </span>
            </div>

            <div className="space-y-3">
              {detail.tasks?.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={fetchDetail}
                  disabled={isFinished}
                />
              ))}
              {totalTasks === 0 && (
                <p className="text-muted-foreground text-center italic py-4">
                  No tasks assigned yet.
                </p>
              )}
            </div>
          </div>

          {/* Mobile View Assessments */}
          <div className="block lg:hidden">
            <Assessments
              score={detail.score}
              maxScore={detail.max_score}
              comments={detail.comments || []}
            />
          </div>
        </div>

        {/* Right Column: Action & Assessments */}
        <div className="space-y-6">
          <div className="hidden lg:block">
            <Assessments
              score={detail.score}
              maxScore={detail.max_score}
              comments={detail.comments || []}
            />
          </div>

          <CompletionBox
            detail={detail}
            onRefresh={fetchDetail}
            courseSubjectId={initialId}
          />
        </div>
      </div>
    </div>
  );
}
