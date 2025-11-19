"use client";

import DailyReportItem from "@/app/(app)/trainee/daily-reports/_DailyReportItem";
import { DailyReport } from "@/types/dailyReport";
import { Button } from "@/components/ui/button";

type Props = {
  reports: DailyReport[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRefresh: () => void;
};

export default function DailyReportsList({
  reports,
  loading,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onRefresh,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl font-medium text-blue-600">
          Loading reports, please wait...
        </p>
      </div>
    );
  }

  if (reports.length === 0 && totalPages <= 1) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
          No Daily Reports Found
        </h3>
        <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new report to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {reports.map((r) => (
          <DailyReportItem key={r.id} dailyReport={r} onRefresh={onRefresh} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="cursor-pointer dark:bg-gray-800 dark:border-gray-700"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="cursor-pointer dark:bg-gray-800 dark:border-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
