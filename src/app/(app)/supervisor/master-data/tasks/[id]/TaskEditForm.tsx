/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { taskSchema, type TaskFormValues } from "@/validations/taskValidation";

interface Props {
  initialData: any;
  subjects: any[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TaskEditForm({ initialData, subjects, onCancel, onSuccess }: Props) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { 
        name: initialData.name, 
        subject_id: initialData.subject_id?.toString() || "" 
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    const payload = { ...values, subject_id: Number(values.subject_id) };
    
    try {
      await axiosClient.put(`/api/tasks/${initialData.id}/`, payload);
      toast.success("Đã cập nhật Task");
      onSuccess();
    } catch (error: any) {
      console.error("Update error:", error);
      const errorData = error.response?.data;
      if (errorData?.non_field_errors) {
            toast.error(errorData.non_field_errors[0]);
      } else if (errorData?.name) {
            form.setError("name", { message: errorData.name[0] });
      } else {
            toast.error("Có lỗi xảy ra khi cập nhật Task"); 
      }
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Chỉnh sửa Task</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tên Môn học <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>Tên Task <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input placeholder="Nhập tên task..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">Hủy</Button>
                <Button type="submit" className="cursor-pointer">Xác nhận</Button>
            </div>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}