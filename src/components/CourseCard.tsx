import React from "react";
import Link from "next/link";
import { Course } from "@/types/course";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Users, BookOpen } from "lucide-react";

// Interface mở rộng cho UI (API trả về thêm các field này)
interface CourseCardData extends Course {
  progress?: number;
  member_count?: number;
  subject_count?: number;
}

interface CourseCardProps {
  course: CourseCardData;
}

// Helper map status sang style
const getStatusConfig = (status: number) => {
  switch (status) {
    case 0: // Not Started
      return { label: "Sắp diễn ra", className: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200" };
    case 1: // In Progress
      return { label: "Đang diễn ra", className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" };
    case 2: // Finished
      return { label: "Đã kết thúc", className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200" };
    default:
      return { label: "Unknown", className: "bg-gray-100 text-gray-500" };
  }
};

export default function CourseCard({ course }: CourseCardProps) {
  // Format ngày
  const startDate = new Date(course.start_date).toLocaleDateString("vi-VN");
  
  // Config status
  const statusConfig = getStatusConfig(course.status);

  // Xử lý Supervisor
  const supervisorName = course.course_supervisors?.length
    ? course.course_supervisors.map((cs) => (cs.supervisor as any).full_name || (cs.supervisor as any).username).join(", ")
    : "Chưa cập nhật";

  // Stats
  const subjectCount = course.subject_count ?? course.course_subjects?.length ?? 0;
  const studentCount = course.member_count ?? 0;
  const progressValue = course.progress ?? 0;

  return (
    <Card className="group h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md border-gray-200">
      <CardHeader className="p-4 pb-2 bg-gray-50/50 border-b border-gray-100 space-y-3">
        {/* Row 1: Date & Status */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">{startDate}</span>
          <Badge variant="outline" className={cn("font-semibold border", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Row 2: Avatar & Title */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage src={course.image || ""} alt={course.name} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {course.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <Link 
            href={`/trainee/courses/${course.id}/detail`} 
            className="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors"
          >
            {course.name}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 grow flex flex-col justify-between gap-4">
        {/* Supervisor */}
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground mr-1">Supervisor:</span>
          <span className="line-clamp-1" title={supervisorName}>{supervisorName}</span>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col items-center gap-1 w-1/2 border-r border-gray-100">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-lg">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              {subjectCount}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Môn học</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 w-1/2">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-lg">
              <Users className="w-4 h-4 text-muted-foreground" />
              {studentCount}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Học viên</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className="font-bold text-primary">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}