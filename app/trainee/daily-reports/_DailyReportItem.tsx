"use client";

import Link from "next/link";
import { DailyReport, DailyReportStatus } from "@/types/dailyReport";

type Props = {
  dailyReport: DailyReport;
};

export default function DailyReportItem({ dailyReport }: Props) {
  const isDraft = dailyReport.status === DailyReportStatus.Draft;

  return (
    <div className="bg-gray-800 text-white border border-gray-600 p-4 mb-3 rounded">
      <div className="flex justify-between items-center">
        <h6 className="font-bold flex items-center gap-2">
          <i className="bi bi-journal-text" /> Daily Report
        </h6>
        <small>{new Date(dailyReport.updated_at).toLocaleString()}</small>
      </div>

      <p className="mt-2">
        <strong className="mr-1">
          <i className="bi bi-book" /> Course:
        </strong>
        {dailyReport.course.name}
      </p>

      <p>
        <strong className="mr-1">
          <i className="bi bi-person" /> Sender:
        </strong>
        {dailyReport.user.name}
      </p>

      <p>
        <i className="bi bi-chat-square-text mr-1" />
        {dailyReport.content.length > 100
          ? dailyReport.content.substring(0, 100) + "..."
          : dailyReport.content}
      </p>

      <div className="flex justify-end gap-2 mt-2">
        {isDraft ? (
          <>
            <button className="btn btn-sm btn-primary">Submit</button>
            <Link
              href={`/trainee/daily-reports/${dailyReport.id}/edit`}
              className="btn btn-sm btn-outline-info"
            >
              Edit
            </Link>
            <button className="btn btn-sm btn-outline-danger">Delete</button>
          </>
        ) : (
          <Link
            href={`/trainee/daily-reports/${dailyReport.id}`}
            className="btn btn-sm btn-outline-secondary"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}
