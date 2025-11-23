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
      subject_categories: [{ subject_id: "" }], // Default 1 empty row
    },
  });

  // Load master data Subject
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
      // Map form values to API structure
      subject_categories: values.subject_categories.map((item) => ({
        subject_id: Number(item.subject_id),
      })),
    };

    try {
      await axiosClient.post("/api/supervisor/categories/", payload);
      toast.success("Category created successfully");
      router.push("/supervisor/master-data/categories");
    } catch (error: any) {
      console.log("Error Response:", error.response?.data);

      const msg = error.response?.data?.message || "Failed to create category";
      if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        !error.response.data.message
      ) {
        const detail = JSON.stringify(error.response.data);
        toast.error(`Error: ${detail}`);
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject List Editor */}
              <SubjectListEditor
                control={form.control}
                allSubjects={allSubjects}
              />

              {/* Footer Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-border bg-background/95 backdrop-blur-sm sticky bottom-0 py-4 z-10 rounded-b-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="cursor-pointer"
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
