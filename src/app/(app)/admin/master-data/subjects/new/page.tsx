/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  subjectSchema,
  type SubjectFormValues,
} from "@/validations/subjectValidation";

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
      toast.success("Subject created successfully");
      router.push("/admin/master-data/subjects");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        const msg =
          error.response.data.name?.[0] ||
          error.response.data.message ||
          "Failed to create subject";

        // Hiển thị toast lỗi gốc từ backend (có thể vẫn là tiếng Việt nếu backend chưa sửa)
        toast.error(msg);

        // Kiểm tra logic trùng tên (hỗ trợ cả tiếng Việt cũ và tiếng Anh nếu backend đổi)
        if (
          msg.toLowerCase().includes("tồn tại") ||
          msg.toLowerCase().includes("exists")
        ) {
          form.setError("name" as any, {
            message: "Subject name already exists",
          });
        }
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Subject Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name..." {...field} />
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
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
