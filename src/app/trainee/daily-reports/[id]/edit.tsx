"use client";

import DailyReportForm from "@//app/trainee/daily-reports/DailyReportForm";

export default function NewDailyReportPage() {
  const courses = [];

  const handleSubmit = (data: any) => {};

  return <DailyReportForm courses={courses} onSubmit={handleSubmit} />;
}
