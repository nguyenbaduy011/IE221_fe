/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { taskSchema, type TaskFormValues } from "@/validations/taskValidation";

export default function NewTaskPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { name: "", subject_id: "" },
  });

  useEffect(() => {
    axiosClient.get("/api/supervisor/subjects/")
        .then(res => {
             const data = res.data.data || res.data;
             setSubjects(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error(err));
  }, []);

  const onSubmit = async (values: TaskFormValues) => {
    const payload = { ...values, subject_id: Number(values.subject_id) };
    
    try {
        await axiosClient.post("/api/tasks/", payload);
        toast.success("Đã tạo Task mới");
        router.push("/supervisor/master-data/tasks");
    } catch (error: any) { 
        console.error("Submit error:", error);
        // Handle duplicate error specifically
        const errorData = error.response?.data;
        if (errorData?.non_field_errors) {
             toast.error(errorData.non_field_errors[0]);
        } else if (errorData?.name) {
             form.setError("name", { message: errorData.name[0] });
        } else {
             toast.error("Có lỗi xảy ra khi lưu Task"); 
        }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
            <CardTitle>Thêm Task Mới</CardTitle>
        </CardHeader>
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
                    <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">Hủy</Button>
                    <Button type="submit" className="cursor-pointer">Thêm</Button>
                </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}