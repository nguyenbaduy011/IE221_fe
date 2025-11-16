"use client";

import { useEffect, useState } from "react";

export default function DailyReportShow({
  params,
}: {
  params: { id: string };
}) {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // fetch API bằng params.id
    // setReport(...)
  }, [params.id]);

  if (!report) return <p>Loading...</p>;

  return (
    <div className="bg-gray-800 text-white p-4 rounded">
      <h2 className="text-lg font-bold">Daily Report</h2>
      <p>
        <strong>Course:</strong> {report.course.name}
      </p>
      <p>
        <strong>Submitted at:</strong>{" "}
        {new Date(report.createdAt).toLocaleDateString()}
      </p>
      <p>
        <strong>Content:</strong> {report.content}
      </p>
    </div>
  );
}
