"use client";

import { useState } from "react";
import { DailyReport, DailyReportStatus } from "@/types/dailyReport";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Save, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn để merge class nếu cần

export type DailyReportFormData = {
  courseId: number;
  content: string;
  status: DailyReportStatus;
};

type Props = {
  dailyReport?: DailyReport;
  courses: Course[];
  onSubmit: (data: DailyReportFormData) => Promise<void>;
  loading?: boolean;
};

export default function DailyReportForm({
  dailyReport,
  courses,
  onSubmit,
  loading = false,
}: Props) {
  const [courseId, setCourseId] = useState<number | "">(
    dailyReport?.course.id || ""
  );
  const [content, setContent] = useState(dailyReport?.content || "");

  const handleSubmit = async (
    e: React.FormEvent,
    status: DailyReportStatus
  ) => {
    e.preventDefault();
    if (!courseId) return;

    await onSubmit({
      courseId: Number(courseId),
      content,
      status,
    });
  };

  // Class chung cho Input/Select/Textarea để đồng bộ style
  const inputClass =
    "w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50";

  return (
    // Sử dụng bg-card và text-card-foreground cho container
    <div className="bg-card text-card-foreground border border-border p-6 rounded-xl shadow-sm">
      <form className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="course"
            className="block text-sm font-medium text-foreground"
          >
            Select Course <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              id="course"
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className={cn(inputClass, "appearance-none")}
              required
              disabled={loading}
            >
              <option value="" disabled>
                -- Select a course --
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {/* Icon chevron */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-foreground"
          >
            Report Content <span className="text-destructive">*</span>
          </label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe what you learned today..."
            className={cn(inputClass, "resize-none")}
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, DailyReportStatus.Draft)}
            disabled={loading || !courseId || !content}
            className="w-full sm:w-auto cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={(e) => handleSubmit(e, DailyReportStatus.Submitted)}
            disabled={loading || !courseId || !content}
            className="w-full sm:w-auto cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  );
}
