"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type DashboardCourse } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import { CourseDetailDialog } from "@/components/CourseDetailDialog"; // Giả sử bạn có component này

// --- Giữ lại các hàm helper từ file cũ ---
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function cho Status Badge (giữ nguyên từ code cũ)
const StatusBadge = ({ status }: { status: number }) => {
  // ... (copy lại code StatusBadge của bạn vào đây) ...
  // Để ngắn gọn mình rút gọn ở đây, bạn paste code cũ vào nhé
  return <Badge>{status}</Badge>;
};
// ---------------------------------------

export const getAdminColumns: ColumnDef<DashboardCourse>[] = [
  // --- CÁC CỘT NAME, DURATION, STATUS, COUNTS GIỮ NGUYÊN ---
  // (Bạn copy lại từ file course-columns.tsx cũ sang đây)
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
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
              {getInitials(course.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
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
  {
    accessorKey: "start_date",
    header: "Duration",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex flex-col text-sm text-muted-foreground">
          <span className="font-medium text-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />{" "}
            {dayjs(course.start_date).format("DD/MM/YYYY")}
          </span>
          <span className="text-xs pl-4">
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
  },
  {
    accessorKey: "supervisor_count",
    header: ({ column }) => <div className="text-center">Trainers</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm">{row.original.supervisor_count}</div>
    ),
  },
  {
    accessorKey: "member_count",
    header: ({ column }) => <div className="text-center">Trainees</div>,
    cell: ({ row }) => (
      <div className="text-center text-sm">{row.original.member_count}</div>
    ),
  },

  // --- CỘT ACTIONS (KHÁC BIỆT CHO ADMIN) ---
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const course = row.original;

      // Hàm xử lý khi click delete (ví dụ)
      const handleDelete = (id: number) => {
        console.log("Delete course ID:", id);
        // Gọi adminApi.deleteCourse(id) ở đây và reload lại bảng
        alert(`Delete functionality for course #${id} needs implementation.`);
      };

      // Hàm xử lý khi click edit
      const handleEdit = (id: number) => {
        console.log("Edit course ID:", id);
        // Điều hướng sang trang edit: router.push(`/admin/courses/${id}/edit`)
      };

      return (
        <div className="flex justify-end items-center gap-1">
          {/* View Button - Tái sử dụng Dialog cũ */}
          {/* Lưu ý: Bạn cần sửa CourseDetailDialog để nó chấp nhận một `trigger` prop tùy chỉnh nếu muốn dùng Button icon nhỏ */}
          {/* Nếu CourseDetailDialog của bạn tự render nút "View", bạn có thể để nguyên hoặc bọc nó lại */}
          <div title="View Details">
            <CourseDetailDialog course={course} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleEdit(course.id)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Course
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleDelete(course.id)}
                className="text-red-600 focus:text-red-600 focus:bg-red-100/50 dark:focus:bg-red-900/50"
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
