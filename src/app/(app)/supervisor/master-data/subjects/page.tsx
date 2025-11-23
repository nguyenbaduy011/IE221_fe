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
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-none flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
          Subject List
        </h2>
        <Link href="/supervisor/master-data/subjects/new">
          <Button className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Add Subject
          </Button>
        </Link>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm relative">
        <div className="absolute inset-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-bold text-muted-foreground">
                  Subject Name
                </TableHead>
                <TableHead className="text-center font-bold text-muted-foreground">
                  Duration (Days)
                </TableHead>
                <TableHead className="text-center font-bold text-muted-foreground">
                  Max Score
                </TableHead>
                <TableHead className="text-center font-bold text-muted-foreground">
                  Tasks Count
                </TableHead>
                <TableHead className="text-right font-bold text-muted-foreground pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <TableCell className="font-medium p-4 align-middle text-foreground">
                      {sub.name}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle text-foreground">
                      {sub.estimated_time_days}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle text-foreground">
                      {sub.max_score}
                    </TableCell>
                    <TableCell className="text-center p-4 align-middle text-foreground">
                      {sub.tasks ? sub.tasks.length : 0}
                    </TableCell>
                    <TableCell className="text-right p-4 align-middle space-x-2 pr-4">
                      <Link href={`/supervisor/master-data/subjects/${sub.id}`}>
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
