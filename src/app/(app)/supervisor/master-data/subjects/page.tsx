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
import { Loader2, Plus, Pencil, Trash2, BookCopy } from "lucide-react";
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
      toast.error("Failed to load subjects list");
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
      toast.success("Subject deleted successfully");
    } catch (error) {
      toast.error("Cannot delete this subject (It might be used in a course)");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading subjects...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookCopy className="w-5 h-5 text-primary" />
            Subject Directory ({subjects.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage all available training subjects and their configurations.
          </p>
        </div>
        <Link href="/supervisor/master-data/subjects/new">
          <Button className="shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Subject
          </Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-bold text-foreground pl-6">
                  Subject Name
                </TableHead>
                <TableHead className="text-center font-bold text-foreground">
                  Duration (Days)
                </TableHead>
                <TableHead className="text-center font-bold text-foreground">
                  Max Score
                </TableHead>
                <TableHead className="text-center font-bold text-foreground">
                  Tasks Count
                </TableHead>
                <TableHead className="text-right font-bold text-foreground pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-32 text-muted-foreground"
                  >
                    No subjects found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  >
                    <TableCell className="font-medium p-4 pl-6 align-middle text-foreground">
                      {sub.name}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle text-muted-foreground">
                      {sub.estimated_time_days}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle text-muted-foreground">
                      {sub.max_score}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {sub.tasks ? sub.tasks.length : 0} tasks
                      </span>
                    </TableCell>
                    <TableCell className="text-right p-4 pr-6 align-middle space-x-2">
                      <Link href={`/supervisor/master-data/subjects/${sub.id}`}>
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
                        onClick={() => confirmDelete(sub)}
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
