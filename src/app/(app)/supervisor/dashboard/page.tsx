/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  BarChart3,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { supervisorApi } from "@/lib/supervisorApi";
import { Card, CardContent } from "@/components/ui/card";
import { getColumns } from "./course-columns";
import { DashboardCourse, DashboardStats } from "@/types/course";
import { OverviewSection } from "./overview-section";
import { SupervisorCourseDataTable } from "./course-data-table";

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass = "bg-primary/10 text-primary",
}: {
  title: string;
  value: string | number;
  icon: any;
  colorClass?: string;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">{value}</h3>
          </div>
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, coursesData] = await Promise.all([
          supervisorApi.getStats(),
          supervisorApi.getMyCourses(),
        ]);

        setStats(statsData);

        const rawCourses: any = coursesData;

        if (rawCourses?.data?.data && Array.isArray(rawCourses.data.data)) {
          setCourses(rawCourses.data.data);
        } else if (rawCourses?.data && Array.isArray(rawCourses.data)) {
          setCourses(rawCourses.data);
        } else if (Array.isArray(rawCourses)) {
          setCourses(rawCourses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your assigned courses and track trainee progress.
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Supervisors"
          value={stats?.total_supervisors || 0}
          icon={Users}
          colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Trainees"
          value={stats?.total_trainees || 0}
          icon={Users}
          colorClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Active Courses"
          value={stats?.active_courses || 0}
          icon={Activity}
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats?.completion_rate || 0}%`}
          icon={BarChart3}
          colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* OVERVIEW SECTION */}
      <OverviewSection
        chartData={stats?.chart_data || []}
        activities={stats?.recent_activities || []}
      />

      {/* TABLE SECTION */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">
            Courses Under Management
          </h2>
        </div>
        <div className="p-6">
          <SupervisorCourseDataTable columns={getColumns} data={courses} />
        </div>
      </div>
    </div>
  );
}
