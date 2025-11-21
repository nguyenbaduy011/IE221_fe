/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { 
  TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function CategoryListPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await axiosClient.get("/api/supervisor/categories/");
      const dataList = res.data.data || res.data;
      setCategories(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
        await axiosClient.delete(`/api/supervisor/categories/${deleteId}/`);
        setCategories((prev) => prev.filter((c) => c.id !== deleteId));
        toast.success("Đã xóa danh mục");
    } catch (error) {
        toast.error("Không thể xóa danh mục này");
    } finally {
        setDeleteId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      
      {/* Header Section */}
      <div className="flex-none flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold tracking-tight">Danh sách Danh mục</h2>
        <Link href="/supervisor/master-data/categories/new">
          <Button className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Thêm Danh mục
          </Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-md border bg-white shadow-sm relative">
        {/* Scrollable Area - Cần thiết để sticky header hoạt động */}
        <div className="absolute inset-0 overflow-auto">
          {/* LƯU Ý: Dùng thẻ <table> thường thay vì component <Table> của shadcn để tránh xung đột scroll */}
          <table className="w-full caption-bottom text-sm text-left">
            <TableHeader className="bg-gray-100 border-b">
              <TableRow>
                {/* Sticky Header Cells */}
                <TableHead className="sticky top-0 z-10 bg-gray-100 font-bold text-gray-700 w-[40%]">
                    Tên Danh mục
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 font-bold text-gray-700 text-center">
                    Số lượng môn học
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-100 font-bold text-gray-700 text-right pr-6">
                    Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                     Không có dữ liệu
                   </TableCell>
                 </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-gray-50 transition-colors border-b">
                    <TableCell className="font-medium p-4 align-middle">
                        {cat.name}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle">
                        {cat.subject_categories?.length || 0}
                    </TableCell>
                    <TableCell className="text-right p-4 align-middle space-x-2 pr-4">
                      <Link href={`/supervisor/master-data/categories/${cat.id}`}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="cursor-pointer hover:bg-red-50 hover:text-red-600 text-destructive"
                        onClick={() => confirmDelete(cat.id)}
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