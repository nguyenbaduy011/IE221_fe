"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { type DashboardCourse } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle, // Import thêm icon này
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"; // Import các component Dialog
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import Link from "next/link";

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

const ActionCell = ({ course }: { course: DashboardCourse }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleConfirmDelete = async () => {
    const toastId = toast.loading("Deleting course...");
    try {
      await adminApi.deleteCourse(course.id);
      toast.success("Course deleted successfully", { id: toastId });
      setIsDeleteDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete course", { id: toastId });
    }
  };

  const handleEdit = () => {
    router.push(`/admin/courses/${course.id}?edit=true`);
  };

  return (
    <>
      <div className="flex justify-end items-center gap-1">
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href={`/admin/courses/${course.id}`}
                className="cursor-pointer w-full flex items-center text-primary font-medium focus:text-primary focus:bg-primary/10"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit Course
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault(); // Ngăn dropdown đóng ngay lập tức để dialog hoạt động mượt hơn
                setIsDeleteDialogOpen(true);
              }}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the course{" "}
              <span className="font-semibold text-foreground">
                &quot;{course.name}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const getAdminColumns: ColumnDef<DashboardCourse>[] = [
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
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <ActionCell course={row.original} />,
  },
];
