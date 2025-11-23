"use client";

import Link from "next/link";
import { DailyReport } from "@/types/dailyReport";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, User, Eye, Clock } from "lucide-react";

type Props = {
  dailyReport: DailyReport;
};

export default function AdminDailyReportItem({ dailyReport }: Props) {
  return (
    <div className="bg-card border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-card-foreground">
      <div className="flex justify-between items-start mb-3">
        <h6 className="font-bold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Daily Report #{dailyReport.id}
        </h6>
        <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(dailyReport.updated_at).toLocaleString()}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <BookOpen className="w-4 h-4 mr-2 shrink-0" />
          <span className="font-semibold mr-1 text-foreground">Course:</span>
          <span className="line-clamp-1">{dailyReport.course.name}</span>
        </div>

        <div className="flex items-center text-muted-foreground">
          <User className="w-4 h-4 mr-2 shrink-0" />
          <span className="font-semibold mr-1 text-foreground">Sender:</span>
          <span>{dailyReport.user.name}</span>
        </div>

        <div className="mt-3 bg-muted/50 p-3 rounded-lg border border-border">
          <p className="text-muted-foreground italic text-sm">
            &quot;
            {dailyReport.content.length > 100
              ? dailyReport.content.substring(0, 100) + "..."
              : dailyReport.content}
            &quot;
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
        <Link href={`/admin/daily-reports/${dailyReport.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <Eye className="w-4 h-4 mr-1" /> View Report
          </Button>
        </Link>
      </div>
    </div>
  );
}
