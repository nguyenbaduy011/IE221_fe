/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { taskSchema, type TaskFormValues } from "@/validations/taskValidation";

export default function TaskFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== "new";
  const [subjects, setSubjects] = useState<any[]>([]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { name: "", subject_id: "" },
  });

  useEffect(() => {
    const initData = async () => {
      try {
        // SỬA 1: Thêm /api và lấy data an toàn cho Subjects
        const subRes = await axiosClient.get("/api/supervisor/subjects/");
        const subjectsData = subRes.data.data || subRes.data;
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

        if (isEdit) {
          // SỬA 2: Thêm /api và lấy data an toàn cho Task Detail
          const taskRes = await axiosClient.get(`/api/tasks/${params.id}/`);
          const data = taskRes.data.data || taskRes.data;
          
          form.reset({ ...data, subject_id: data.subject_id?.toString() });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Lỗi tải dữ liệu");
      }
    };
    initData();
  }, [isEdit, params.id, form]);

  const onSubmit = async (values: TaskFormValues) => {
    const payload = { ...values, subject_id: Number(values.subject_id) };
    
    try {
      if (isEdit) {
        // SỬA 3: Thêm /api vào đường dẫn submit
        await axiosClient.put(`/api/tasks/${params.id}/`, payload);
        toast.success("Đã cập nhật Task");
      } else {
        await axiosClient.post("/api/tasks/", payload);
        toast.success("Đã tạo Task mới");
      }
      router.push("/supervisor/master-data/tasks");
    } catch (error) { 
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra khi lưu Task"); 
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{isEdit ? "Cập nhật Task" : "Tạo Task mới"}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thuộc Môn học</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn môn học" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Task</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}