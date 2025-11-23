/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "@/lib/axiosClient";
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
import TaskListEditor from "./TaskListEditor";

interface Props {
  initialData: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function SubjectEditForm({
  initialData,
  onCancel,
  onSuccess,
}: Props) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData.name,
      max_score: initialData.max_score,
      estimated_time_days: initialData.estimated_time_days,
      tasks:
        initialData.tasks?.map((t: any) => ({
          id: t.id,
          name: t.name,
          position: t.position || 0,
        })) || [],
    },
  });

  const onSubmit = async (values: SubjectFormValues) => {
    const taskNames = values.tasks?.map((t) => t.name.trim().toLowerCase());
    const hasDuplicate = taskNames?.some(
      (name, index) => taskNames.indexOf(name) !== index
    );

    if (hasDuplicate) {
      toast.error("Task names must be unique within the same subject");
      return;
    }

    const payload = {
      ...values,
      tasks: values.tasks?.map((t, index) => ({
        id: (t as any).id,
        name: t.name,
        position: index + 1, 
      })),
    };

    try {
      await axiosClient.put(
        `/api/supervisor/subjects/${initialData.id}/`,
        payload
      );
      toast.success("Subject updated successfully");

      onSuccess();

      router.push("/supervisor/master-data/subjects");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update subject";
      toast.error(msg);
      if (msg.toLowerCase().includes("name")) {
        form.setError("name" as any, { message: msg });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: General Info */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Field Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter subject name..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              {/* Field Duration */}
              <FormField
                control={form.control}
                name="estimated_time_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={(field.value as number | string) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field Max Score */}
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={(field.value as number | string) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
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
        <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 border-t border-border z-10 rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
