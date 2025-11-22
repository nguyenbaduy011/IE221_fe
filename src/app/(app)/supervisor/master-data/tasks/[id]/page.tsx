/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

import TaskDetailView from "./TaskDetailView";
import TaskEditForm from "./TaskEditForm";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [task, setTask] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [taskRes, subRes] = await Promise.all([
         axiosClient.get(`/api/tasks/${params.id}/`),
         axiosClient.get("/api/supervisor/subjects/")
      ]);

      setTask(taskRes.data.data || taskRes.data);
      const subjectsData = subRes.data.data || subRes.data;
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Không thể tải thông tin Task");
      router.push("/supervisor/master-data/tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchData();
  }, [params.id]);

  const handleUpdateSuccess = () => {
    router.push("/supervisor/master-data/tasks");
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!task) return <div className="text-center p-10">Không tìm thấy Task</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="pl-0 hover:bg-transparent hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
        
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
          </Button>
        )}
      </div>

      {isEditing ? (
        <TaskEditForm 
          initialData={task} 
          subjects={subjects}
          onCancel={() => setIsEditing(false)} 
          onSuccess={handleUpdateSuccess} 
        />
      ) : (
        <TaskDetailView task={task} />
      )}
    </div>
  );
}