/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Calendar, AlertCircle, Clock, Users } from "lucide-react";

import type { CourseDetailResponse, SubjectItem } from "@/types/courseDetail";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { courseApi } from "@/lib/courseApi";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "--/--/----";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US").format(date);
  } catch (e) {
    return dateString;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Finished":
    case "Finished early":
    case "Finished on time":
      return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
    case "In Progress":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
    case "Finished but overdue":
    case "Overdue":
      return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
    case "Not Started":
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
  }
};

const getTimelineStatusColor = (status: string) => {
  switch (status) {
    case "Finished":
    case "Finished early":
    case "Finished on time":
      return "bg-green-500 border-green-500 text-white";
    case "In Progress":
      return "bg-blue-500 border-blue-500 text-white";
    default:
      return "bg-muted border-primary/20 text-muted-foreground";
  }
};

export default function TraineeCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(
    null
  );

  useEffect(() => {
    if (!courseId) return;
    const fetchDetail = async () => {
      try {
        const res = await courseApi.getTraineeCourseDetail(courseId);
        setCourse(res.data.data || res.data);
      } catch (error) {
        console.error("Failed to fetch course detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  const handleOpenFeedback = (subject: SubjectItem) => {
    setSelectedSubject(subject);
    setIsFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setSelectedSubject(null);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Course not found</AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* --- Course Header --- */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail */}
            <div className="relative w-full md:w-48 h-40 rounded-lg overflow-hidden shrink-0 bg-muted">
              {course.image ? (
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <BookOpen className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {/* --- STATUS COLOR --- */}
                <Badge
                  variant="outline"
                  className={`border-0 ${getStatusColor(
                    course.status_display
                  )}`}
                >
                  {course.status_display}
                </Badge>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {course.start_date_fmt} - {course.finish_date_fmt}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">{course.name}</h1>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Created by{" "}
                  <span className="font-medium text-foreground">
                    {course.creator_name}
                  </span>
                </p>
                <p className="text-xs">Last updated: {course.updated_at_fmt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger
              value="subjects"
              className="flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              Subjects ({course.subjects?.count ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Members (
              {(course.members?.trainees?.count ?? 0) +
                (course.members?.trainers?.count ?? 0)}
              )
            </TabsTrigger>
          </TabsList>

          {/* --- Tab 1: Subjects --- */}
          <TabsContent value="subjects" className="mt-6 space-y-4">
            {course.subjects?.list && course.subjects.list.length > 0 ? (
              <div className="space-y-3">
                {course.subjects.list.map((subject, index) => (
                  <Card
                    key={subject.id}
                    className="overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4 md:p-6">
                        {/* Timeline Dot & Line */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="relative">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getTimelineStatusColor(
                                subject.my_status
                              )}`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          {index < (course.subjects?.list?.length ?? 0) - 1 && (
                            <div className="w-0.5 h-full bg-border min-h-10"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">
                                {subject.subject_name}
                              </h3>

                              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 shrink-0" />
                                  <span>
                                    {formatDate(subject.start_date)} -{" "}
                                    {formatDate(subject.finish_date)}
                                  </span>
                                </div>
                                <div>
                                  Status: {/* --- SUBJECT STATUS COLOR --- */}
                                  <Badge
                                    variant="outline"
                                    className={`ml-1 border-0 ${getStatusColor(
                                      subject.my_status
                                    )}`}
                                  >
                                    {subject.my_status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Score & Action */}
                            <div className="flex items-center gap-4 sm:justify-end">
                              {subject.my_score !== null && (
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Score
                                  </p>
                                  <p className="text-xl font-bold">
                                    {subject.my_score}
                                    <span className="text-sm text-muted-foreground font-normal">
                                      /{subject.max_score}
                                    </span>
                                  </p>
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/trainee/subjects/${subject.id}`)
                                }
                                className="cursor-pointer"
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">
                    There are no subjects in this course yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* --- Tab 2: Members --- */}
          <TabsContent value="members" className="mt-6 space-y-6">
            {/* Trainers */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <h3 className="text-lg font-semibold">
                  Trainer list ({course.members?.trainers?.count ?? 0})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {course.members?.trainers?.list?.map((trainer) => (
                  <Card
                    key={trainer.id}
                    className="hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {trainer.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {trainer.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">Trainer</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trainees */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <h3 className="text-lg font-semibold">
                  Trainee list ({course.members?.trainees?.count ?? 0})
                </h3>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                          Joined At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {course.members?.trainees?.list?.map((trainee) => (
                        <tr
                          key={trainee.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-muted">
                                  {trainee.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {trainee.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {/* --- TRAINEE STATUS COLOR --- */}
                            <Badge
                              variant="outline"
                              className={`border-0 ${getStatusColor(
                                trainee.status
                              )}`}
                            >
                              {trainee.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {trainee.joined_at}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- Feedback Dialog --- */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
          </DialogHeader>

          {selectedSubject && (
            <div className="space-y-4">
              {/* Score Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Score
                  </p>
                  <div className="text-3xl font-bold text-primary">
                    {selectedSubject.my_score ?? "--"}
                    <span className="text-base text-muted-foreground font-normal">
                      {" "}
                      / {selectedSubject.max_score}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Feedback</h4>
                {selectedSubject.supervisor_comment ? (
                  <Card className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          S
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">Supervisor</p>
                          <span className="text-xs text-muted-foreground">
                            {selectedSubject.comment_at || "Recently"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedSubject.supervisor_comment}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Alert variant="default" className="border-dashed">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No feedback yet.</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
