/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      toast.error("Không thể tải dữ liệu");
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
      toast.success("Đã xóa Task thành công");
    } catch (error) {
      toast.error("Lỗi khi xóa Task");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredTasks = filterSubjectId && filterSubjectId !== "all"
    ? tasks.filter((t) => t.subject_id === Number(filterSubjectId))
    : tasks;

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-none flex justify-between items-end bg-white p-4 rounded-lg shadow-sm border">
        <div className="w-[300px]">
            <label className="text-sm font-medium mb-2 block">Lọc theo môn học</label>
            <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <Link href="/admin/master-data/tasks/new">
          <Button className="cursor-pointer"><Plus className="w-4 h-4 mr-2" /> Thêm Task</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-md border bg-white shadow-sm relative">
        <div className="absolute inset-0 overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
            <TableHeader className="bg-gray-100 border-b">
                <TableRow>
                <TableHead className="sticky top-0 z-10 bg-gray-100 font-bold text-gray-700">Tên Task</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 font-bold text-gray-700">Thuộc Môn học</TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 font-bold text-gray-700 text-right pr-6">Hành động</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredTasks.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    Không có dữ liệu
                    </TableCell>
                </TableRow>
                ) : (
                filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-gray-50 transition-colors border-b">
                    <TableCell className="font-medium p-4 align-middle">{task.name}</TableCell>
                    <TableCell className="text-muted-foreground p-4 align-middle">
                        {task.subject_name || "---"}
                    </TableCell>
                    <TableCell className="text-right p-4 align-middle space-x-2 pr-4">
                        <Link href={`/admin/master-data/tasks/${task.id}`}>
                        <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600">
                            <Pencil className="w-4 h-4" />
                        </Button>
                        </Link>
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="cursor-pointer hover:bg-red-50 hover:text-red-600 text-destructive"
                        onClick={() => confirmDelete(task.id)}
                        >
                        <Trash2 className="w-4 h-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            </table>
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