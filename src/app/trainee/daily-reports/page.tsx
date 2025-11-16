"use client";

import { useState, useEffect } from "react";
import DailyReportItem from "@//app/trainee/daily-reports/_DailyReportItem";
import DailyReportsFilter from "@//app/trainee/daily-reports/DailyReportsFilter";

export default function DailyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (courseId?: number, date?: string) => {
    setLoading(true);
    try {
      // TODO: replace with your API call
      // const res = await fetch(`/api/reports?courseId=${courseId}&date=${date}`);
      // const data = await res.json();
      const data: any[] = []; // mock data
      setReports(data);
    } catch (error) {
      console.error(error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // fetch courses
    // setCourses(await ...)
  }, []);

  return (
    <div>
      <DailyReportsFilter
        courses={courses}
        onFilter={(courseId, date) => fetchReports(courseId, date)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-400 mt-4">No reports found</p>
      ) : (
        reports.map((r) => <DailyReportItem key={r.id} dailyReport={r} />)
      )}
    </div>
  );
}
