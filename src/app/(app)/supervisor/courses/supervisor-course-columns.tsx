/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DashboardCourse } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal, ExternalLink, Edit } from "lucide-react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";

// Helper lấy ký tự đầu
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper Badge trạng thái
const StatusBadge = ({ status }: { status: number }) => {
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Not Started
        </Badge>
      );
    case 1:
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-200"
        >
          In Progress
        </Badge>
      );
    case 2:
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200"
        >
          Finished
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

// Action Cell: CHỈ CÓ VIEW & EDIT, KHÔNG CÓ DELETE
const SupervisorActionCell = ({ course }: { course: DashboardCourse }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/supervisor/courses/${course.id}?edit=true`);
  };

  return (
    <div className="flex justify-end items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href={`/supervisor/courses/${course.id}`}
              className="cursor-pointer w-full flex items-center text-primary font-medium"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Supervisor được phép sửa nội dung, nhưng không được xóa khóa học */}
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" /> Edit Content
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Định nghĩa các cột
export const getSupervisorColumns: ColumnDef<DashboardCourse>[] = [
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-lg border border-border shrink-0">
            <AvatarImage src={course.image || ""} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
              {getInitials(course.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-[180px]">
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
    accessorKey: "categories",
    header: "Category",
    cell: ({ row }) => {
      const categories = row.original.categories || [];
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <Badge key={cat.id} variant="secondary" className="text-xs">
              {cat.name}
            </Badge>
          ))}
          {categories.length === 0 && (
            <span className="text-muted-foreground text-xs">--</span>
          )}
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
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: "equals",
  },
  {
    accessorKey: "member_count",
    header: ({ column }) => (
      <div className="text-center font-medium">Trainees</div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.original.member_count}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <SupervisorActionCell course={row.original} />,
  },
];
