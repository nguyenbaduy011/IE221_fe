"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type DashboardCourse } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen } from "lucide-react";
import dayjs from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CourseDetailDialog } from "@/components/CourseDetailDialog";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Sửa lại StatusBadge cho khớp với Admin Management Page
const StatusBadge = ({ status }: { status: number }) => {
  switch (status) {
    case 0: // Not Started
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border hover:bg-muted/80"
        >
          Not Started
        </Badge>
      );
    case 1: // In Progress
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
        >
          In Progress
        </Badge>
      );
    case 2: // Finished
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        >
          Finished
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export const getColumns: ColumnDef<DashboardCourse>[] = [
  {
    accessorKey: "name",
    header: "Course Name",
    size: 250,
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg border border-border shrink-0">
            <AvatarImage
              src={course.image || ""}
              alt={course.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
              {getInitials(course.name)}
            </AvatarFallback>
          </Avatar>

          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex flex-col min-w-0 cursor-pointer group">
                <span
                  className="block w-[180px] truncate font-semibold text-sm text-foreground group-hover:text-primary transition-colors"
                  title={course.name}
                >
                  {course.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: #{course.id}
                </span>
              </div>
            </HoverCardTrigger>

            <HoverCardContent className="w-80 p-0 border border-border/50 shadow-lg">
              <div className="bg-background p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-semibold text-sm">Course Overview</span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
                    Full Course Name
                  </p>
                  <p className="text-sm font-semibold text-foreground leading-snug wrap-break-words">
                    {course.name}
                  </p>
                </div>

                <div className="border-t border-border/30 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                    Timeline
                  </p>
                  <div className="flex flex-col gap-1 text-sm text-foreground/80">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-mono">
                        {dayjs(course.start_date).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span className="font-mono">
                        {dayjs(course.finish_date).format("DD/MM/YYYY")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 flex justify-between items-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Current Status
                  </p>
                  <StatusBadge status={course.status} />
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    },
  },

  {
    accessorKey: "start_date",
    header: "Duration",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-1.5 text-foreground/80">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">
              {dayjs(course.start_date).format("DD/MM/YYYY")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground pl-5">
            to {dayjs(course.finish_date).format("DD/MM/YYYY")}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    // Thêm filterFn: "equals" để lọc chính xác giá trị số 0, 1, 2
    filterFn: "equals",
  },

  {
    accessorKey: "supervisor_count",
    header: () => <div className="text-center">Trainers</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          {row.original.supervisor_count ?? 0}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "member_count",
    header: () => <div className="text-center">Trainees</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          {row.original.member_count ?? 0}
        </span>
      </div>
    ),
  },

  {
    id: "actions",
    header: () => <div className="text-right pr-2">View</div>,
    cell: ({ row }) => (
      <div className="flex justify-end pr-2">
        <CourseDetailDialog course={row.original} />
      </div>
    ),
  },
];
