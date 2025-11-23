// src/app/(app)/trainee/subjects/[id]/SubjectDetailClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
// Bỏ useParams vì đã nhận props, hoặc giữ lại làm fallback ádadasdasda
import { SubjectDetail, TaskStatus } from "@/types/subject";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Assessments from "./[id]/_components/Assessments";
import CompletionBox from "./[id]/_components/CompletionBox";
import ProgressBar from "./[id]/_components/ProgressBar";
import StudentInfo from "./[id]/_components/StudentInfo";
import TaskItem from "./[id]/_components/TaskItem";


// 1. Thêm interface Props nhận ID từ cha
type Props = {
  initialId: number;
};

// 2. Nhận props vào component
export default function SubjectDetailClient({ initialId }: Props) {
  // Sử dụng trực tiếp initialId được truyền từ server
  const id = initialId;

  const [detail, setDetail] = useState<SubjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    // Check kỹ id
    if (!id || isNaN(id)) {
        console.error("ID không hợp lệ:", id);
        setLoading(false);
        return;
    }

    try {
      // Gọi API thật
      const res = await subjectApi.getDetail(id);
      setDetail(res.data.data);
    } catch (error) {
      console.error("Lỗi fetch detail:", error);
      toast.error("Không thể tải thông tin môn học");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600 font-medium">Đang tải môn học #{id}...</span>
      </div>
    );
  }

  if (!detail) {
    return (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
            <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy môn học</h2>
            <p className="text-gray-500">Mã môn học (ID: {id}) không tồn tại hoặc bạn chưa được gán vào môn này.</p>
            <button 
                onClick={() => window.location.href = '/trainee/my-subjects'} // Sửa link về danh sách môn của bạn
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Quay lại danh sách
            </button>
        </div>
    );
  }

  // --- Phần Render giữ nguyên như cũ ---
  const totalTasks = detail.tasks.length;
  const completedTasks = detail.tasks.filter(t => t.status === TaskStatus.DONE).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const isFinished = detail.status >= 2;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      <StudentInfo 
        studentName={detail.student.name}
        courseName={detail.course.name}
        courseStart={detail.course.start_date}
        courseEnd={detail.course.finish_date}
        courseStatus={detail.course.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <ProgressBar subjectName={detail.subject_name} percent={progressPercent} />

           <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
             <h3 className="text-lg font-bold mb-4 dark:text-white">Tasks List</h3>
             <div className="space-y-3">
                {detail.tasks.map(task => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onUpdate={fetchDetail} 
                        disabled={isFinished}
                    />
                ))}
             </div>
           </div>
           
           <div className="block lg:hidden">
              <Assessments score={detail.score} maxScore={detail.max_score} comments={detail.comments} />
           </div>
        </div>

        <div className="space-y-6">
            <div className="hidden lg:block">
                <Assessments score={detail.score} maxScore={detail.max_score} comments={detail.comments} />
            </div>
            <CompletionBox detail={detail} onRefresh={fetchDetail} />
        </div>
      </div>
    </div>
  );
}