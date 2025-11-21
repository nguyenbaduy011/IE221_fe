/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

import CategoryDetailView from "./CategoryDetailView";
import CategoryEditForm from "./CategoryEditForm";

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [category, setCategory] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        axiosClient.get(`/api/supervisor/categories/${params.id}/`),
        axiosClient.get("/api/supervisor/subjects/")
      ]);

      setCategory(catRes.data.data || catRes.data);
      const subData = subRes.data.data || subRes.data;
      setAllSubjects(Array.isArray(subData) ? subData : []);
      
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu");
      router.push("/supervisor/master-data/categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchData();
  }, [params.id]);

  const handleUpdateSuccess = () => {
    router.push("/supervisor/master-data/categories");
    
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!category) return <div className="text-center p-10">Không tìm thấy danh mục</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
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
        <CategoryEditForm 
          initialData={category} 
          allSubjects={allSubjects}
          onCancel={() => setIsEditing(false)} 
          onSuccess={handleUpdateSuccess} 
        />
      ) : (
        <CategoryDetailView category={category} />
      )}
    </div>
  );
}