/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { 
  TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function SubjectListPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get("/api/supervisor/subjects/");
      const dataList = res.data.data || res.data;
      
      if (Array.isArray(dataList)) {
        setSubjects(dataList);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (subject: any) => {
    setDeleteId(subject.id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await axiosClient.delete(`/api/supervisor/subjects/${deleteId}/`);
      setSubjects((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Đã xóa môn học và các nhiệm vụ liên quan");
    } catch (error) {
      toast.error("Không thể xóa môn học này (Có thể đang được sử dụng trong khóa học)");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      
      {/* Header */}
      <div className="flex-none flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold tracking-tight">Danh sách Môn học</h2>
        <Link href="/admin/master-data/subjects/new">
          <Button className="cursor-pointer"><Plus className="w-4 h-4 mr-2" /> Thêm môn học</Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-md border bg-white shadow-sm relative">
        {/* Scrollable Area */}
        <div className="absolute inset-0 overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <TableHeader className="bg-gray-100 border-b">
              <TableRow>
                <TableHead className="sticky top-0 z-10 bg-gray-100 w-[300px] font-bold text-gray-700">
                    Tên môn học
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 text-center font-bold text-gray-700">
                    Thời lượng (Ngày)
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 text-center font-bold text-gray-700">
                    Điểm tối đa
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 text-center font-bold text-gray-700">
                    Số nhiệm vụ
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 text-right font-bold text-gray-700 pr-6">
                    Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-gray-50 transition-colors border-b">
                    <TableCell className="font-medium p-4 align-middle">{sub.name}</TableCell>
                    <TableCell className="text-center p-4 align-middle">{sub.estimated_time_days}</TableCell>
                    <TableCell className="text-center p-4 align-middle">{sub.max_score}</TableCell>
                    <TableCell className="text-center p-4 align-middle">
                        {sub.tasks ? sub.tasks.length : 0}
                    </TableCell>
                    <TableCell className="text-right p-4 align-middle space-x-2 pr-4">
                      <Link href={`/admin/master-data/subjects/${sub.id}`}>
                        <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-blue-50 hover:text-blue-600">
                            <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="cursor-pointer hover:bg-red-50 hover:text-red-600 text-destructive"
                        onClick={() => confirmDelete(sub)}
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
