/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import { Course } from "@/types/course";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen } from "lucide-react";

interface CourseCardData extends Course {
  progress?: number;
  member_count?: number;
  subject_count?: number;
}

interface CourseCardProps {
  course: CourseCardData;
}

const getStatusConfig = (status: number) => {
  switch (status) {
    case 0: 
      return {
        label: "Not Started",
        className:
          "bg-muted text-muted-foreground border-border hover:bg-muted/80",
      };
    case 1: 
      return {
        label: "In Progress",
        className:
          "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      };
    case 2: 
      return {
        label: "Finished",
        className:
          "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      };
    default:
      return {
        label: "Unknown",
        className: "bg-muted text-muted-foreground border-border",
      };
  }
};

export default function CourseCard({ course }: CourseCardProps) {
  const startDate = new Date(course.start_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const statusConfig = getStatusConfig(course.status);

  const supervisorName = course.course_supervisors?.length
    ? course.course_supervisors
        .map(
          (cs) =>
            (cs.supervisor as any).full_name || (cs.supervisor as any).username
        )
        .join(", ")
    : "Not updated";

  const subjectCount =
    course.subject_count ?? course.course_subjects?.length ?? 0;
  const studentCount = course.member_count ?? 0;
  const progressValue = course.progress ?? 0;

  return (
    <Card className="group h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md border-border bg-card text-card-foreground">
      <CardHeader className="p-4 pb-2 bg-muted/30 border-b border-border space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">
            {startDate}
          </span>
          <Badge
            variant="outline"
            className={cn("font-semibold border", statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage
              src={course.image || ""}
              alt={course.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {course.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Link
            href={`/trainee/courses/${course.id}/detail`}
            className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground"
          >
            {course.name}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 grow flex flex-col justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground mr-1">
            Supervisor:
          </span>
          <span className="line-clamp-1" title={supervisorName}>
            {supervisorName}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col items-center gap-1 w-1/2 border-r border-border">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-lg">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              {subjectCount}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Subjects
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 w-1/2">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-lg">
              <Users className="w-4 h-4 text-muted-foreground" />
              {studentCount}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Members
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-primary">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2 bg-secondary" />
        </div>
      </CardContent>
    </Card>
  );
}
