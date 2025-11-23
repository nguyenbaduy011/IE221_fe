/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { subjectSchema, type SubjectFormValues } from "@/validations/subjectValidation";
import TaskListEditor from "./TaskListEditor";

interface Props {
    initialData: any;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function SubjectEditForm({ initialData, onCancel, onSuccess }: Props) {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: initialData.name,
            max_score: initialData.max_score,
            estimated_time_days: initialData.estimated_time_days,
            // Map dữ liệu tasks ban đầu, quan trọng là giữ lại ID và Position
            tasks: initialData.tasks?.map((t: any) => ({
                id: t.id, 
                name: t.name,
                position: t.position || 0
            })) || []
        },
    });

    const onSubmit = async (values: SubjectFormValues) => {
        // Validate: check trùng tên task trong danh sách
        const taskNames = values.tasks?.map(t => t.name.trim().toLowerCase());
        const hasDuplicate = taskNames?.some((name, index) => taskNames.indexOf(name) !== index);
        
        if (hasDuplicate) {
            toast.error("Tên nhiệm vụ không được trùng nhau trong cùng một môn học");
            return;
        }

        const payload = {
            ...values,
            // Gửi danh sách tasks kèm ID (nếu có) và Position (theo index mảng)
            tasks: values.tasks?.map((t, index) => ({
                id: (t as any).id, // Backend sẽ dùng ID này để update, nếu không có ID sẽ tạo mới
                name: t.name,
                position: index + 1 // Cập nhật vị trí mới nhất theo thứ tự trên UI
            }))
        };

        try {
            await axiosClient.put(`/api/supervisor/subjects/${initialData.id}/`, payload);
            toast.success("Cập nhật thành công");
            
            // Gọi callback onSuccess (nếu cần xử lý ở component cha)
            onSuccess();

            // Điều hướng về trang danh sách Subject
            router.push("/admin/master-data/subjects"); 
            
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi cập nhật môn học";
            toast.error(msg);
            if (msg.toLowerCase().includes("tên môn học")) {
                form.setError("name" as any, { message: msg });
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Card 1: Thông tin chung */}
                <Card>
                    <CardHeader><CardTitle>Chỉnh sửa thông tin</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        
                        {/* Field Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên môn học <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            {/* Field Thời gian */}
                            <FormField
                                control={form.control}
                                name="estimated_time_days"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thời gian (Ngày)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min={0} 
                                                {...field} 
                                                value={(field.value as number | string) ?? ""} 
                                                onChange={e => field.onChange(e.target.value)} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Field Điểm tối đa */}
                            <FormField
                                control={form.control}
                                name="max_score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Điểm tối đa</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min={0} 
                                                {...field} 
                                                value={(field.value as number | string) ?? ""} 
                                                onChange={e => field.onChange(e.target.value)} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Task List Editor */}
                <TaskListEditor control={form.control as any} />

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t z-10 rounded-b-lg">
                    <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                        Hủy bỏ
                    </Button>
                    <Button type="submit" className="cursor-pointer">
                        Xác nhận
                    </Button>
                </div>
            </form>
        </Form>
    );
}