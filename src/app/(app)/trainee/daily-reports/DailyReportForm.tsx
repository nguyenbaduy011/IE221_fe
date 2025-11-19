"use client";

import { useState } from "react";
import { DailyReport, DailyReportStatus } from "@/types/dailyReport";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Save, Send, Loader2 } from "lucide-react";

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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
      <form className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="course"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select Course <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="course"
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white appearance-none"
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
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Report Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe what you learned today..."
            className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, DailyReportStatus.Draft)}
            disabled={loading || !courseId || !content}
            className="w-full sm:w-auto"
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
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
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
