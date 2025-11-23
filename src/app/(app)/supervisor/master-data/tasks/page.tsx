/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function TaskListPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterSubjectId, setFilterSubjectId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchAll = async () => {
    try {
      const [tasksRes, subjectsRes] = await Promise.all([
        axiosClient.get("/api/tasks/"),
        axiosClient.get("/api/supervisor/subjects/"),
      ]);

      const tasksData = tasksRes.data.data || tasksRes.data;
      const subjectsData = subjectsRes.data.data || subjectsRes.data;

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await axiosClient.delete(`/api/tasks/${deleteId}/`);
      setTasks((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredTasks =
    filterSubjectId && filterSubjectId !== "all"
      ? tasks.filter((t) => t.subject_id === Number(filterSubjectId))
      : tasks;

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-none flex flex-col sm:flex-row justify-between items-end bg-card p-4 rounded-lg shadow-sm border border-border gap-4">
        <div className="w-full sm:w-[300px]">
          <label className="text-sm font-medium mb-2 block text-foreground">
            Filter by Subject
          </label>
          <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Link href="/supervisor/master-data/tasks/new">
          <Button className="cursor-pointer w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm relative">
        <div className="absolute inset-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-muted-foreground">
                  Task Name
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Subject
                </TableHead>
                <TableHead className="font-bold text-muted-foreground text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No tasks available.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <TableCell className="font-medium p-4 align-middle text-foreground">
                      {task.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground p-4 align-middle">
                      {task.subject_name || "---"}
                    </TableCell>
                    <TableCell className="text-right p-4 align-middle space-x-2 pr-4">
                      <Link href={`/supervisor/master-data/tasks/${task.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-destructive"
                        onClick={() => confirmDelete(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        count={1}
        onConfirm={handleDelete}
      />
    </div>
  );
}
