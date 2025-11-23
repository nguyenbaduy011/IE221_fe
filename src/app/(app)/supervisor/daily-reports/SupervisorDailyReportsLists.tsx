"use client";

import SupervisorDailyReportItem from "./SupervisorDailyReportItem";
import { DailyReport } from "@/types/dailyReport";
import { Button } from "@/components/ui/button";
import { Loader2, FileX, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  reports: DailyReport[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export default function SupervisorDailyReportsList({
  reports,
  loading,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-60 bg-card rounded-xl shadow-sm border border-border">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium text-primary">
          Loading reports...
        </p>
      </div>
    );
  }

  if (reports.length === 0 && totalPages <= 1) {
    return (
      <div className="text-center py-16 bg-card rounded-xl shadow-sm border border-border">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-muted/50 rounded-full">
            <FileX className="w-12 h-12 text-muted-foreground/50" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          No Daily Reports Found
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          No trainee reports match your current filter. Try adjusting the
          filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {reports.map((r) => (
          <SupervisorDailyReportItem key={r.id} dailyReport={r} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium text-foreground">{totalPages}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
