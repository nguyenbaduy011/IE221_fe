"use client";

import { DashboardCourse, CourseStatus } from "@/types/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Link as LinkIcon,
  Users,
  Eye,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    case CourseStatus.NOT_STARTED:
      return <Badge variant="secondary">Upcoming</Badge>;
    case CourseStatus.IN_PROGRESS:
      return <Badge variant="default">Active</Badge>;
    case CourseStatus.FINISHED:
      return (
        <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-200">
          Completed
        </Badge>
      );
    default:
      return null;
  }
};

interface CourseDetailDialogProps {
  course: DashboardCourse;
}

export function CourseDetailDialog({ course }: CourseDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary cursor-pointer"
        >
          <span className="sr-only">View Details</span>
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-lg border border-border">
              <AvatarImage src={course.image || ""} className="object-cover" />
              <AvatarFallback className="rounded-lg text-lg bg-primary/10 text-primary">
                {getInitials(course.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <DialogTitle className="text-xl leading-tight">
                {course.name}
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Course ID: #{course.id}
              </DialogDescription>
              <div className="pt-1">
                <StatusBadge status={course.status} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Timeline
              </h4>
              <div className="text-sm space-y-1 pl-6 border-l-2 border-muted ml-2">
                <p>
                  <span className="text-muted-foreground">Start:</span>{" "}
                  {dayjs(course.start_date).format("DD MMM, YYYY")}
                </p>
                <p>
                  <span className="text-muted-foreground">End:</span>{" "}
                  {dayjs(course.finish_date).format("DD MMM, YYYY")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                Resources
              </h4>
              <div className="pl-6 border-l-2 border-muted ml-2">
                {course.link_to_course ? (
                  <a
                    href={course.link_to_course}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all block"
                  >
                    Course Link
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    No link provided
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border my-1"></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-900/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Trainers</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {course.supervisor_count}
                </span>
                <span className="text-xs text-muted-foreground">trainers</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Trainees</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {course.member_count}
                </span>
                <span className="text-xs text-muted-foreground">enrolled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Close
            </Button>
          </DialogClose>
          <Button
            asChild
            className="cursor-pointer font-medium"
          >
            <Link
              href={`/admin/courses/${course.id}`}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View Details
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
