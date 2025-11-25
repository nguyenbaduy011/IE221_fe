/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/validations/categoryValidation";
import SubjectListEditor from "../[id]/SubjectListEditor";

export default function NewCategoryPage() {
  const router = useRouter();
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      subject_categories: [{ subject_id: "" }],
    },
  });

  useEffect(() => {
    axiosClient
      .get("/api/supervisor/subjects/")
      .then((res) => {
        const data = res.data.data || res.data;
        setAllSubjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, []);

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      subject_categories: values.subject_categories.map((item) => ({
        subject_id: Number(item.subject_id),
      })),
    };

    try {
      await axiosClient.post("/api/supervisor/categories/", payload);
      toast.success("Tạo danh mục thành công");
      router.push("/admin/master-data/categories");
    } catch (error: any) {
      console.log("Error Response:", error.response?.data);

      const msg = error.response?.data?.message || "Lỗi tạo danh mục";
      if (error.response?.data && typeof error.response.data === "object") {
        const detail = JSON.stringify(error.response.data);
        toast.error(`Lỗi: ${detail}`);
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Tạo Danh mục mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tên danh mục */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên danh mục <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên danh mục..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Danh sách môn học */}
              <SubjectListEditor
                control={form.control}
                allSubjects={allSubjects}
              />

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
                <Button type="submit">Thêm</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
