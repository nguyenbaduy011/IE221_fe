"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityData, ChartData } from "@/types/course";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface OverviewSectionProps {
  chartData: ChartData[];
  activities: ActivityData[];
}

const getInitials = (name: string) => {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
};

export function OverviewSection({
  chartData,
  activities,
}: OverviewSectionProps) {

  const hasChartData = chartData.some((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
      {/* 1. BIỂU ĐỒ TRẠNG THÁI KHÓA HỌC */}
      <Card className="col-span-1 md:col-span-4">
        <CardHeader>
          <CardTitle>Course Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-sm">
                No course data available to display chart.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. HOẠT ĐỘNG GẦN ĐÂY */}
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={activity.avatar} alt={activity.user} />
                      <AvatarFallback>
                        {getInitials(activity.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        <span className="text-primary">{activity.user}</span>{" "}
                        <span className="text-muted-foreground font-normal">
                          {activity.action}
                        </span>
                      </p>
                      <p
                        className="text-sm text-foreground font-medium truncate max-w-[200px]"
                        title={activity.target}
                      >
                        {activity.target}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* Format thời gian thành "2 hours ago" */}
                        {dayjs(activity.time).fromNow()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm pt-10">
                  No recent activities found.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
