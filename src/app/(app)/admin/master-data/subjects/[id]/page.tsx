/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

// Import các component đã tách ra
import SubjectEditForm from "./SubjectEditForm";
import SubjectDetailView from "./SubjectDetailView";

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Hàm gọi API lấy chi tiết môn học
  const fetchDetail = async () => {
    try {
      const res = await axiosClient.get(`/api/supervisor/subjects/${params.id}/`);
      // Xử lý data tùy theo cấu trúc API trả về (trực tiếp hoặc lồng trong data)
      const data = res.data.data || res.data;
      setSubject(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin môn học");
      router.push("/admin/master-data/subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  // Xử lý khi update thành công từ Form con
  const handleUpdateSuccess = () => {
    setIsEditing(false); // Tắt chế độ sửa
    fetchDetail();       // Load lại dữ liệu mới nhất
  };

  // 1. Màn hình Loading
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // 2. Màn hình lỗi / Không tìm thấy
  if (!subject) {
    return <div className="text-center p-10 text-muted-foreground">Không tìm thấy môn học</div>;
  }

  // 3. Màn hình chính
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header điều hướng chung */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="cursor-pointer pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
        
        {/* Nút Sửa chỉ hiện khi đang ở chế độ Xem */}
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Logic chuyển đổi giữa Xem và Sửa */}
      {isEditing ? (
        <SubjectEditForm 
          initialData={subject} 
          onCancel={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
        />
      ) : (
        <SubjectDetailView subject={subject} />
      )}
    </div>
  );
}