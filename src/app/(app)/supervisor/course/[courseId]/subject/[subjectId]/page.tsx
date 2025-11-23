/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, use, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  Circle,
  User as UserIcon,
  Plus,
  Save,
  CheckSquare,
  MoreHorizontal,
  Trash2,
  Loader2,
  AlertCircle,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import dayjs from "dayjs";

import {
  SubjectDetail,
  TaskStatus,
  Trainee,
  UserTask,
} from "@/types/subjectDetails";
import { subjectApi } from "@/lib/subjectApi";

const getInitials = (name: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "--";

interface PageProps {
  params: Promise<{
    courseId: string;
    subjectId: string;
  }>;
}

export default function TraineeSubjectDetailPage({ params }: PageProps) {
  const { courseId, subjectId } = use(params);

  // --- STATES ---
  const [students, setStudents] = useState<Trainee[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [subjectData, setSubjectData] = useState<SubjectDetail | null>(null);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isEditingAssessment, setIsEditingAssessment] = useState(false);

  // --- FETCH DATA ---
  const fetchSubjectDetail = useCallback(async () => {
    if (!selectedStudentId) return;

    try {
      setLoadingDetail(true);
      const res = await subjectApi.getDetail(subjectId, selectedStudentId);

      let finalData = res as any;
      // Bóc tách dữ liệu
      while (finalData && finalData.data && !finalData.id) {
        finalData = finalData.data;
      }

      if (!finalData || !finalData.id) {
        throw new Error("Invalid data format received from API");
      }

      if (!finalData.tasks) finalData.tasks = [];

      setSubjectData(finalData);
      setScore(finalData.score || 0);
      setComment(finalData.supervisor_comment || "");
    } catch (error) {
      console.error("Failed to fetch subject detail:", error);
      toast.error("Could not load subject details.");
    } finally {
      setLoadingDetail(false);
    }
  }, [subjectId, selectedStudentId]);

  useEffect(() => {
    const fetchClassmates = async () => {
      try {
        setLoadingStudents(true);
        const res = await subjectApi.getClassmates(courseId);
        const responseBody = (res as any).data;
        let finalStudents: Trainee[] = [];

        if (responseBody?.data?.data && Array.isArray(responseBody.data.data)) {
          finalStudents = responseBody.data.data;
        } else if (responseBody?.data && Array.isArray(responseBody.data)) {
          finalStudents = responseBody.data;
        } else if (Array.isArray(responseBody)) {
          finalStudents = responseBody;
        }

        setStudents(finalStudents);
        if (finalStudents.length > 0 && !selectedStudentId) {
          setSelectedStudentId(finalStudents[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch classmates:", error);
        toast.error("Could not load students list.");
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchClassmates();
  }, [courseId, selectedStudentId]);

  useEffect(() => {
    fetchSubjectDetail();
  }, [fetchSubjectDetail]);

  useEffect(() => {
    if (subjectData) {
      if (
        (subjectData.score === null || subjectData.score === 0) &&
        !subjectData.supervisor_comment
      ) {
        setIsEditingAssessment(true);
      } else {
        setIsEditingAssessment(false);
      }
    }
  }, [subjectData]);

  // --- COMPUTED ---
  const progressPercent = useMemo(() => {
    if (!subjectData || !subjectData.tasks || subjectData.tasks.length === 0) {
      return 0;
    }
    const completed = subjectData.tasks.filter(
      (t) => t.status === TaskStatus.DONE
    ).length;
    return Math.round((completed / subjectData.tasks.length) * 100);
  }, [subjectData]);

  const currentStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  // --- HELPER: GET BADGE COLOR ---
  const getScoreBadgeVariant = (s: number | null | undefined, max: number) => {
    if (s === null || s === undefined)
      return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200";
    if (s >= max / 2)
      return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200";
    return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200";
  };

  const getScoreLabel = (s: number | null | undefined, max: number) => {
    if (s === null || s === undefined) return "Not Graded";
    if (s >= max / 2) return "Passed";
    return "Failed";
  };

  // --- HANDLERS ---
  const handleCompleteSubject = async () => {
    if (!subjectData) return;
    setIsSaving(true);
    try {
      await subjectApi.completeSubject(subjectData.id);
      const updatedTasks = subjectData.tasks.map((t) => ({
        ...t,
        status: TaskStatus.DONE,
      }));
      setSubjectData({
        ...subjectData,
        status: "COMPLETED",
        actual_end_date: dayjs().format("YYYY-MM-DD"),
        tasks: updatedTasks,
      });
      toast.success("Subject marked as completed.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete subject.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = async (taskName: string) => {
    setIsSaving(true);
    try {
      await subjectApi.addTask(subjectId, taskName);
      toast.success("Task added successfully.");
      await fetchSubjectDetail();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTask = async (
    taskId: number,
    currentStatus: TaskStatus
  ) => {
    if (!subjectData) return;
    const newStatus =
      currentStatus === TaskStatus.DONE ? TaskStatus.NOT_DONE : TaskStatus.DONE;

    setSubjectData((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId ? { ...t, status: newStatus } : t
            ),
          }
        : null
    );

    try {
      await subjectApi.toggleTask(taskId, newStatus);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task status.");
      setSubjectData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((t) =>
                t.id === taskId ? { ...t, status: currentStatus } : t
              ),
            }
          : null
      );
    }
  };

  const handleSaveAssessment = async () => {
    if (!subjectData) return;
    setIsSaving(true);
    try {
      await subjectApi.saveAssessment(subjectData.id, score, comment);
      toast.success("Assessment updated successfully.");
      await fetchSubjectDetail();
      setIsEditingAssessment(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update assessment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (subjectData) {
      setScore(subjectData.score || 0);
      setComment(subjectData.supervisor_comment || "");
    }
    setIsEditingAssessment(false);
  };

  return (
    <div className="flex h-full bg-background">
      {/* === LEFT PANEL: STUDENT NAVIGATOR === */}
      {/* Cập nhật: w-72, overflow-hidden để tránh double scroll */}
      <aside className="w-72 border-r border-border bg-card flex flex-col shadow-sm shrink-0">
        <div className="p-4 border-b border-border shrink-0">
          <h3 className="font-bold text-sm flex items-center gap-2 text-foreground uppercase tracking-wide">
            <UserIcon className="w-4 h-4 text-primary" />
            Students
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {students.length} classmates
          </p>
        </div>

        {/* ScrollArea cho danh sách user */}
        <ScrollArea className="h-full w-full">
          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                    selectedStudentId === student.id
                      ? "bg-primary/15 border-l-2 border-l-primary text-primary"
                      : "hover:bg-muted/60 border-l-2 border-l-transparent text-foreground"
                  }`}
                >
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage src={student.avatar || ""} />
                    <AvatarFallback className="text-xs font-semibold bg-background">
                      {getInitials(student.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium truncate">
                      {student.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto bg-linear-to-b from-background via-background to-muted/5 p-8">
        {loadingDetail ? (
          <div className="flex h-full items-center justify-center flex-col gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading details...</p>
          </div>
        ) : !subjectData ? (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground">
            <AlertCircle className="w-12 h-12 opacity-20" />
            <p className="text-lg">Select a student to begin</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-border/40">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {subjectData.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {subjectData.course_name}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dayjs(subjectData.last_updated).format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <AddTaskDialog onAdd={handleAddTask} isLoading={isSaving} />

                <Button
                  onClick={handleCompleteSubject}
                  disabled={subjectData.status === "COMPLETED" || isSaving}
                  className={
                    subjectData.status === "COMPLETED"
                      ? "bg-green-500/10 text-green-600 border border-green-200/50 hover:bg-green-500/20"
                      : ""
                  }
                  variant={
                    subjectData.status === "COMPLETED" ? "outline" : "default"
                  }
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : subjectData.status === "COMPLETED" ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckSquare className="mr-2 h-4 w-4" />
                  )}
                  {subjectData.status === "COMPLETED"
                    ? "Completed"
                    : "Complete"}
                </Button>
              </div>
            </div>

            {/* OVERVIEW GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-none border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary">
                        {getInitials(currentStudent?.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm uppercase text-muted-foreground font-semibold tracking-wide mb-1">
                        Trainee
                      </h3>
                      <p className="font-bold text-lg text-foreground">
                        {currentStudent?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentStudent?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-2">
                        Supervisor
                      </p>
                      <p className="font-semibold text-foreground">
                        {subjectData.supervisor_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-2">
                        Duration
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="font-semibold text-foreground">
                          {subjectData.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border/50">
                <CardContent className="pt-6">
                  <h4 className="text-sm uppercase text-muted-foreground font-semibold tracking-wide mb-4">
                    Timeline
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Planned:</span>
                      <span className="font-mono font-medium">
                        {dayjs(subjectData.start_date).format("DD/MM")} →{" "}
                        {dayjs(subjectData.end_date).format("DD/MM")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual:</span>
                      <span className="font-mono font-medium">
                        {subjectData.actual_start_date
                          ? dayjs(subjectData.actual_start_date).format("DD/MM")
                          : "--"}
                        {subjectData.actual_end_date
                          ? ` → ${dayjs(subjectData.actual_end_date).format(
                              "DD/MM"
                            )}`
                          : " → --"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TASK PROGRESS */}
            <Card className="shadow-none border-border/50">
              <CardHeader className="border-b border-border/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold">
                    Tasks Progress
                  </CardTitle>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        progressPercent === 100
                          ? "text-green-600"
                          : "text-primary"
                      }`}
                    >
                      {progressPercent}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {subjectData.tasks?.filter(
                        (t) => t.status === TaskStatus.DONE
                      ).length || 0}{" "}
                      of {subjectData.tasks?.length || 0}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Progress value={progressPercent} className="h-3 mb-6" />
                <div className="space-y-3">
                  {!subjectData.tasks || subjectData.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 italic">
                      No tasks yet
                    </p>
                  ) : (
                    subjectData.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <button
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className="shrink-0 transition-all"
                        >
                          {task.status === TaskStatus.DONE ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm font-medium transition-all ${
                            task.status === TaskStatus.DONE
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.name}
                        </span>

                        {/* Quick Toggle via Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleTask(task.id, task.status)
                              }
                            >
                              {task.status === TaskStatus.DONE
                                ? "Mark as Not Done"
                                : "Mark as Done"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ASSESSMENT SECTION */}
            <Card className="shadow-none border-border/50">
              <CardHeader className="border-b border-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Save className="w-5 h-5 text-primary" />
                  Assessment Result
                </CardTitle>

                {!isEditingAssessment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingAssessment(true)}
                    className="gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-8">
                {isEditingAssessment ? (
                  // --- CHẾ ĐỘ EDIT ---
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-1 space-y-2">
                        <Label className="font-bold text-sm text-primary uppercase tracking-wide">
                          Score
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="text-xl font-bold text-center border-2 border-primary/30 focus:border-primary"
                            max={subjectData.max_score}
                            min={0}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                            / {subjectData.max_score}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-2">
                        <Label className="font-bold text-sm text-primary uppercase tracking-wide">
                          Feedback
                        </Label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your constructive feedback..."
                          className="min-h-[120px] border-2 border-border/50 focus:border-primary resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                      <Button
                        onClick={handleSaveAssessment}
                        disabled={isSaving}
                        className="min-w-[120px]"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // --- CHẾ ĐỘ VIEW (MÀU SẮC) ---
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-6 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                        <div className="flex-1">
                          <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">
                            Score
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-primary">
                              {subjectData.score ?? "--"}
                            </span>
                            <span className="text-lg text-muted-foreground font-semibold">
                              / {subjectData.max_score}
                            </span>
                          </div>

                          {/* THÊM MÀU CHO BADGE */}
                          <Badge
                            className={`mt-4 border font-bold px-3 py-1 text-sm ${getScoreBadgeVariant(subjectData.score, subjectData.max_score)}`}
                            variant="outline"
                          >
                            {getScoreLabel(
                              subjectData.score,
                              subjectData.max_score
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm uppercase text-muted-foreground font-bold tracking-wider">
                          Supervisor Feedback
                        </h4>
                        <div className="p-6 bg-muted/30 rounded-xl border border-border/50 text-sm leading-relaxed text-foreground">
                          {subjectData.supervisor_comment ? (
                            subjectData.supervisor_comment
                          ) : (
                            <span className="text-muted-foreground italic">
                              No feedback provided
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {subjectData.comment_updated_at && (
                            <p>
                              Updated:{" "}
                              <span className="font-semibold">
                                {dayjs(subjectData.comment_updated_at).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </span>
                            </p>
                          )}
                          <p>
                            By:{" "}
                            <span className="font-semibold text-foreground">
                              {subjectData.supervisor_name}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// --- ADD TASK DIALOG (Giữ nguyên như cũ) ---
function AddTaskDialog({
  onAdd,
  isLoading,
}: {
  onAdd: (name: string) => void;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");

  const handleSubmit = () => {
    if (!taskName.trim()) return;
    onAdd(taskName);
    setTaskName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild id="add-task-trigger">
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label>Task Name</Label>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g., Submit Final Report"
            className="mt-2"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 p-3 rounded-md mt-3 text-xs flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              This task will be added to <strong>all trainees</strong> currently
              enrolled in this subject.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Confirm Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
