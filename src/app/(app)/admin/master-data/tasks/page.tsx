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
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  CheckSquare,
  Filter,
} from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading tasks...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          Task Management ({filteredTasks.length})
        </h2>
        <p className="text-sm text-muted-foreground">
          Define and manage individual tasks assigned to specific subjects.
        </p>
      </div>

      {/* Toolbar: Filter & Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="w-full sm:w-[300px] space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter by Subject
          </label>
          <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
            <SelectTrigger className="bg-background">
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

        {/* Updated Link to Supervisor route */}
        <Link href="/supervisor/master-data/tasks/new">
          <Button className="w-full sm:w-auto shadow-sm cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-foreground pl-6">
                  Task Name
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  Subject
                </TableHead>
                <TableHead className="font-bold text-foreground text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-32 text-muted-foreground"
                  >
                    No tasks found matching the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  >
                    <TableCell className="font-medium p-4 pl-6 align-middle text-foreground">
                      {task.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground p-4 align-middle">
                      {task.subject_name ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                          {task.subject_name}
                        </span>
                      ) : (
                        "---"
                      )}
                    </TableCell>
                    <TableCell className="text-right p-4 pr-6 align-middle space-x-2">
                      {/* Updated Link to Supervisor route */}
                      <Link href={`/supervisor/master-data/tasks/${task.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
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
