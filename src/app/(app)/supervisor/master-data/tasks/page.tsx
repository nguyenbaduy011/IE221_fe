/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function TaskListPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterSubjectId, setFilterSubjectId] = useState<string>("all");

  // State xóa
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Gọi API lấy cả danh sách Task và Subject
        const [tasksRes, subjectsRes] = await Promise.all([
          axiosClient.get("/api/tasks/"),
          axiosClient.get("/api/supervisor/subjects/"),
        ]);

        // SỬA LỖI: Lấy data an toàn (res.data.data || res.data)
        const tasksData = tasksRes.data.data || tasksRes.data;
        const subjectsData = subjectsRes.data.data || subjectsRes.data;

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu");
      }
    };
    fetchAll();
  }, []);

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      // SỬA LỖI: Đồng bộ đường dẫn API xóa
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

  const getSubjectName = (id: number) => subjects.find((s) => s.id === id)?.name || "---";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
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
        <Link href="/supervisor/master-data/tasks/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Thêm Task</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên Task</TableHead>
              <TableHead>Thuộc Môn học</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
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
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell className="text-muted-foreground">{getSubjectName(task.subject_id)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/supervisor/master-data/tasks/${task.id}`}>
                      <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
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

      <DeleteConfirmDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        count={1} 
        onConfirm={handleDelete} 
      />
    </div>
  );
}