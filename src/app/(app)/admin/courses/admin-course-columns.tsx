"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type DashboardCourse } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Giả sử bạn có component này, nếu chưa thì thay bằng div tạm
import { CourseDetailDialog } from "@/components/CourseDetailDialog";
import { toast } from "sonner";

// --- Helpers ---
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

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

export const getAdminColumns: ColumnDef<DashboardCourse>[] = [
  // --- Course Name ---
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-lg border border-border shrink-0">
            <AvatarImage
              src={course.image || ""}
              alt={course.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
              {getInitials(course.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[300px]">
            <span
              className="truncate font-medium text-sm text-foreground"
              title={course.name}
            >
              {course.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              ID: #{course.id}
            </span>
          </div>
        </div>
      );
    },
  },
  // --- Duration ---
  {
    accessorKey: "start_date",
    header: "Duration",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex flex-col text-sm text-muted-foreground">
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />{" "}
            {dayjs(course.start_date).format("DD/MM/YYYY")}
          </span>
          <span className="text-xs pl-5">
            to {dayjs(course.finish_date).format("DD/MM/YYYY")}
          </span>
        </div>
      );
    },
  },
  // --- Status ---
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  // --- Trainers Count ---
  {
    accessorKey: "supervisor_count",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground font-medium">
        Trainers
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium text-foreground">
        {row.original.supervisor_count}
      </div>
    ),
  },
  // --- Trainees Count ---
  {
    accessorKey: "member_count",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground font-medium">
        Trainees
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium text-foreground">
        {row.original.member_count}
      </div>
    ),
  },

  // --- ACTIONS ---
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const course = row.original;

      // Hàm xử lý khi click delete
      const handleDelete = (id: number) => {
        console.log("Delete course ID:", id);
        toast.info(`Delete functionality for course #${id} triggered`);
      };

      // Hàm xử lý khi click edit
      const handleEdit = (id: number) => {
        console.log("Edit course ID:", id);
        // router.push(`/admin/courses/${id}/edit`)
        toast.info(`Edit functionality for course #${id} triggered`);
      };

      return (
        <div className="flex justify-end items-center gap-1">
          {/* View Detail Trigger */}
          <div title="View Details">
            <CourseDetailDialog course={course} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleEdit(course.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Course
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleDelete(course.id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
