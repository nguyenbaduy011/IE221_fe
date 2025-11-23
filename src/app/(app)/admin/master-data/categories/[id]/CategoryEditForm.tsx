/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { categorySchema, type CategoryFormValues } from "@/validations/categoryValidation";
import SubjectListEditor from "./SubjectListEditor";

interface Props {
    initialData: any;
    allSubjects: any[];
    onCancel: () => void;
    onSuccess: () => void;
}

export default function CategoryEditForm({ initialData, allSubjects, onCancel, onSuccess }: Props) {
    // Transform data từ API về dạng Form Values
    const defaultValues: CategoryFormValues = {
        name: initialData.name,
        subject_categories: initialData.subject_categories?.map((item: any) => ({
            subject_id: item.subject?.id.toString() || ""
        })) || []
    };

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues,
    });

    const onSubmit = async (values: CategoryFormValues) => {
        const payload = {
            name: values.name,
            subject_categories: values.subject_categories.map((item) => ({
                subject_id: Number(item.subject_id) 
            }))
        };

        try {
            await axiosClient.put(`/api/supervisor/categories/${initialData.id}/`, payload);
            toast.success("Cập nhật danh mục thành công");
            onSuccess();
        } catch (error: any) {
            console.error("Update Error:", error.response?.data);
            
            const msg = error.response?.data?.message || "Lỗi cập nhật danh mục";
            if (error.response?.data && typeof error.response.data === 'object') {
                toast.error(`Lỗi: ${JSON.stringify(error.response.data)}`);
            } else {
                toast.error(msg);
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Card 1: Thông tin chung */}
                <Card>
                    <CardHeader><CardTitle>Chỉnh sửa thông tin</CardTitle></CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên danh mục <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input {...field} placeholder="Nhập tên danh mục..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Card 2: Editor danh sách môn học */}
                <SubjectListEditor control={form.control} allSubjects={allSubjects} />

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t bg-white sticky bottom-0 py-4 z-10">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit">
                        Xác nhận
                    </Button>
                </div>
            </form>
        </Form>
    );
}