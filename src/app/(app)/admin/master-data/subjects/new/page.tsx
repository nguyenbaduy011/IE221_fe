/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { subjectSchema, type SubjectFormValues } from "@/validations/subjectValidation";

export default function NewSubjectPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      max_score: 0,
      estimated_time_days: 0,
      tasks: [],
    },
  });

  const onSubmit = async (values: SubjectFormValues) => {
    try {
        await axiosClient.post("/api/supervisor/subjects/", values);
        toast.success("Thêm môn học thành công");
        router.push("/admin/master-data/subjects");
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            const msg = error.response.data.name?.[0] || error.response.data.message || "Lỗi khi thêm môn học";
            toast.error(msg);
            
            if (msg.toLowerCase().includes("tồn tại")) {
                form.setError("name" as any, { message: "Tên môn học đã tồn tại" });
            }
        } else {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <Card>
        <CardHeader>
            <CardTitle>Thêm Môn Học Mới</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tên môn học <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Nhập tên môn học..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => router.back()}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" className="cursor-pointer">Thêm</Button>
                </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}