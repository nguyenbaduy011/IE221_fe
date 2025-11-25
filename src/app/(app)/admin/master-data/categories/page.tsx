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
import { Pencil, Trash2, Plus, Loader2, Tags } from "lucide-react";
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
      toast.error("Failed to load categories");
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
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">
          Loading categories...
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Tags className="w-5 h-5 text-primary" />
            Category Definitions ({categories.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage categories used to organize subjects and courses.
          </p>
        </div>

        {/* Updated Link to Supervisor route */}
        <Link href="/supervisor/master-data/categories/new">
          <Button className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%] font-bold text-foreground pl-6">
                  Category Name
                </TableHead>
                <TableHead className="text-center font-bold text-foreground">
                  Subjects Count
                </TableHead>
                <TableHead className="text-right font-bold text-foreground pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-32 text-muted-foreground"
                  >
                    No categories found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  >
                    <TableCell className="font-medium p-4 pl-6 align-middle text-foreground">
                      {cat.name}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle text-muted-foreground">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {cat.subject_categories?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right p-4 pr-6 align-middle space-x-2">
                      {/* Updated Link to Supervisor route */}
                      <Link
                        href={`/supervisor/master-data/categories/${cat.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => confirmDelete(cat.id)}
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
