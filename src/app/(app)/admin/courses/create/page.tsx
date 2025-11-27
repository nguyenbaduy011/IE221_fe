/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form"; // Chỉ import useForm
import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi, Subject } from "@/lib/adminApi";
import { userApi } from "@/lib/userApi";
import { User, UserRole } from "@/types/user";
import { Loader2, Upload, X, ArrowLeft, Save } from "lucide-react";

import { courseSchema, CourseFormValues } from "@/validations/courseValidation";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Image from "next/image";
import { Category } from "@/types/course";

export default function CreateCoursePage() {
  const router = useRouter();

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableSupervisors, setAvailableSupervisors] = useState<User[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      link_to_course: "",
      start_date: "",
      finish_date: "",
      subject_ids: [],
      supervisor_ids: [],
      categories: [],
    },
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoadingData(true);
        const [subjectsRes, usersRes, categoriesRes] = await Promise.all([
          adminApi.getAllSubjects(),
          userApi.getAll(),
          adminApi.getAllCategories(),
        ]);
        const subjectsData =
          (subjectsRes.data as any).data || subjectsRes.data || [];
        setAvailableSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        const usersData = (usersRes.data as any).data || usersRes.data || [];
        const allUsers = Array.isArray(usersData) ? usersData : [];
        const supervisors = allUsers.filter(
          (u: User) => u.role === UserRole.SUPERVISOR
        );
        setAvailableSupervisors(supervisors);

        const categoriesData =
          (categoriesRes.data as any).data || categoriesRes.data || [];
        setAvailableCategories(
          Array.isArray(categoriesData) ? categoriesData : []
        );
      } catch (error) {
        console.error("Failed to load resources:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchResources();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (values: CourseFormValues) => {
    try {
      setIsSubmitting(true);
      const payload = {
        name: values.name,
        start_date: values.start_date,
        finish_date: values.finish_date,
        link_to_course: values.link_to_course,
        image: selectedImage,
        subjects: values.subject_ids,
        supervisors: values.supervisor_ids,
        categories: values.categories,
        status: 0,
      };

      const res = await adminApi.createCourse(payload);
      const responseBody = (res as any).data || res;
      const newCourseId = responseBody.id || responseBody.data?.id;

      if (newCourseId) {
        toast.success("Success: Created new course");
        router.push(`/admin/courses/${newCourseId}`);
      } else {
        toast.error("Can't find ID. Return to course list");
        router.push("/admin/courses");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create new Course
          </h1>
          <p className="text-muted-foreground text-sm">
            Fill information to create Course.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Course&apos;s name{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example: ReactJS Advanced 2024"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link_to_course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Start date{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="finish_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Finish date{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {availableCategories.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No categories available.
                        </p>
                      )}
                      {availableCategories.map((cat) => (
                        <FormField
                          key={cat.id}
                          control={form.control}
                          name="categories"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-1">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cat.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            cat.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== cat.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  {cat.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject ({availableSubjects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {availableSubjects.map((subject) => (
                        <FormField
                          key={subject.id}
                          control={form.control}
                          name="subject_ids"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2 border-b last:border-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(subject.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            subject.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== subject.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-1">
                                  {subject.name}{" "}
                                  <span className="text-xs text-muted-foreground">
                                    ({subject.estimated_time_days} days)
                                  </span>
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage>
                      {form.formState.errors.subject_ids?.message}
                    </FormMessage>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-video rounded-md border border-dashed flex items-center justify-center overflow-hidden bg-muted/30">
                      {previewUrl ? (
                        <>
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 cursor-pointer"
                            onClick={removeImage}
                            type="button"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground p-4">
                          <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-xs">No picture chosen</p>
                        </div>
                      )}
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Trainer <span className="text-destructive">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] w-full rounded-md border p-4">
                    {availableSupervisors.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">
                        No chosen Trainer.
                      </p>
                    )}
                    <div className="space-y-2">
                      {availableSupervisors.map((user) => (
                        <FormField
                          key={user.id}
                          control={form.control}
                          name="supervisor_ids"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-2 border-b last:border-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          user.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== user.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="flex flex-col">
                                <FormLabel className="font-normal cursor-pointer">
                                  {user.full_name}
                                </FormLabel>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage>
                      {form.formState.errors.supervisor_ids?.message}
                    </FormMessage>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
            <div className="container max-w-5xl flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Course
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
