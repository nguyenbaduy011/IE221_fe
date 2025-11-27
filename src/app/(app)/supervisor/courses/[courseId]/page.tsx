/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  X,
  Pencil,
  BookOpen,
  Users,
  AlertCircle,
  ArrowLeft,
  Eye,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import { toast, Toaster } from "sonner";

import axiosClient from "@/lib/axiosClient";
import { courseApi } from "@/lib/courseApi";
import { adminApi, AdminCourseDetail } from "@/lib/adminApi";
import { supervisorApi } from "@/lib/supervisorApi"; // Thêm import này
import { User } from "@/types/user";
import {
  UserRole,
  CourseEditForm,
  ConfirmModalState,
  Category,
} from "@/types/course";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// Import các components
import { PeopleList } from "@/components/PeopleList";
import { SubjectsTab } from "@/components/SubjectsTab";
import { BackButton } from "@/components/ui/back-button";

// --- HELPERS ---
const getInitials = (name: string | null | undefined) => {
  if (!name) return "";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("https")) return path;
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
  return path.startsWith("/")
    ? `${backendUrl}${path}`
    : `${backendUrl}/${path}`;
};

const StatusBadge = ({ status }: { status: number }) => {
  switch (status) {
    case 0:
      return <Badge variant="outline">Not Started</Badge>;
    case 1:
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-700 border-blue-200"
        >
          In Progress
        </Badge>
      );
    case 2:
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200"
        >
          Finished
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function SupervisorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);

  // State
  const [role, setRole] = useState<UserRole>("TRAINEE");
  const [loadingRole, setLoadingRole] = useState(true);
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [trainees, setTrainees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [isEditing, setIsEditing] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [editForm, setEditForm] = useState<CourseEditForm>({
    name: "",
    start_date: "",
    finish_date: "",
    link_to_course: "",
    category_ids: [],
  });

  // 1. Check Role & Auth
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await axiosClient.get("/auth/me/");
        const user = (res.data as any).data || res.data;
        if (user && user.role) {
          setRole(user.role);
          if (user.role !== "SUPERVISOR" && user.role !== "ADMIN") {
            router.push("/");
          }
        }
      } catch (error) {
        toast.error("Authentication failed");
        router.push("/login");
      } finally {
        setLoadingRole(false);
      }
    };
    checkRole();
  }, []);

  // 2. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Gọi API song song
      const [courseRes, traineesRes, categoriesRes] = await Promise.all([
        courseApi.getDetail(courseId, role),
        courseApi.getTrainees(courseId, role),
        supervisorApi.getAllCategories(),
      ]);

      let courseData = (courseRes.data as any).data || courseRes.data;
      if (courseData && courseData.data && !courseData.name) {
        courseData = courseData.data;
      }
      setCourse(courseData);

      // --- XỬ LÝ TRAINEES (SỬA LỖI MAP IS NOT A FUNCTION) ---
      let traineesRaw: any = traineesRes;

      // Bóc lớp data của axios nếu có
      if (traineesRaw.data) traineesRaw = traineesRaw.data;

      // Bóc tiếp nếu backend bọc thêm lớp data nữa
      if (traineesRaw.data && !Array.isArray(traineesRaw))
        traineesRaw = traineesRaw.data;

      let validTrainees: User[] = [];

      if (Array.isArray(traineesRaw)) {
        validTrainees = traineesRaw;
      } else if (traineesRaw?.results && Array.isArray(traineesRaw.results)) {
        // Trường hợp phân trang Django
        validTrainees = traineesRaw.results;
      } else if (traineesRaw?.data && Array.isArray(traineesRaw.data)) {
        // Trường hợp backend bọc trong .data
        validTrainees = traineesRaw.data;
      } else {
        console.warn(
          "Trainees data format unknown, fallback to empty array:",
          traineesRaw
        );
        validTrainees = []; // Fallback an toàn tuyệt đối
      }

      console.log("Final Trainees List:", validTrainees);
      setTrainees(validTrainees);

      let validCategories: Category[] = [];

      // Lấy data gốc từ axios
      const rawCat = (categoriesRes.data as any) || categoriesRes;

      // Bóc tách các trường hợp API trả về:
      if (Array.isArray(rawCat)) {
        // Trường hợp 1: Trả về mảng trực tiếp [{}, {}]
        validCategories = rawCat;
      } else if (rawCat?.data && Array.isArray(rawCat.data)) {
        // Trường hợp 2: Bọc trong data { data: [] }
        validCategories = rawCat.data;
      } else if (rawCat?.results && Array.isArray(rawCat.results)) {
        // Trường hợp 3: Phân trang Django { count: 10, results: [] }
        validCategories = rawCat.results;
      }

      console.log("Final Categories List:", validCategories);
      setAvailableCategories(validCategories);

      // Setup Form dữ liệu cho chế độ Edit
      if (courseData) {
        setEditForm({
          name: courseData.name || "",
          start_date: courseData.start_date || "",
          finish_date: courseData.finish_date || "",
          link_to_course: courseData.link_to_course || "",
          category_ids: courseData.categories
            ? courseData.categories.map((c: any) => c.id)
            : [],
        });
      }
    } catch (error) {
      console.error("Fetch error details:", error);
      toast.error("Failed to load data or access denied");
      router.push("/supervisor/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingRole && courseId) fetchData();
  }, [courseId, loadingRole, role]);

  const handleSave = async () => {
    // Supervisor logic save nếu cần (hiện tại Admin mới sửa được general info)
    setIsEditing(false);
    toast.info("Exited edit mode.");
  };

  // Logic thêm/xóa Trainee/Supervisor (Giữ nguyên)
  const handleAddTrainee = async (uid: number) => {
    try {
      await courseApi.addTrainees(courseId, [uid], role);
      toast.success("Trainee added");
      fetchData();
    } catch (e) {
      toast.error("Failed to add trainee");
    }
  };

  const handleRemoveTrainee = async (uid: number) => {
    try {
      await courseApi.removeTrainee(courseId, uid, role);
      toast.success("Trainee removed");
      setTrainees((p) => p.filter((t) => t.id !== uid));
    } catch (e) {
      toast.error("Failed to remove trainee");
    }
  };

  const handleAddSupervisor = async (uid: number) => {
    try {
      await courseApi.addSupervisors(courseId, [uid], role);
      toast.success("Supervisor added");
      fetchData();
    } catch (e) {
      toast.error("Failed to add supervisor");
    }
  };

  const handleRemoveSupervisor = async (uid: number) => {
    try {
      await courseApi.removeSupervisor(courseId, uid, role);
      toast.success("Supervisor removed");
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to remove supervisor");
    }
  };

  const confirmDeletePerson = (id: number, type: "Trainee" | "Supervisor") => {
    setConfirmModal({
      isOpen: true,
      title: `Remove ${type}?`,
      description: `Are you sure you want to remove this ${type.toLowerCase()} from the course?`,
      onConfirm: () =>
        type === "Trainee"
          ? handleRemoveTrainee(id)
          : handleRemoveSupervisor(id),
    });
  };

  if (loading || loadingRole)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

  const rawSupervisors = course?.supervisors || [];
  const supervisorList = Array.isArray(rawSupervisors)
    ? rawSupervisors.map((s: any) => s.supervisor || s)
    : [];

  const canManageSupervisors = role === "ADMIN";
  const canEditGeneralInfo = role === "ADMIN";

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 pb-24">
      <Toaster position="top-center" richColors />

      <BackButton href="/supervisor/courses" />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Detail</h1>
        <Button
          variant={isEditing ? "destructive" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" /> Exit Manage Mode
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" /> Manage Course
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border shadow-sm rounded-lg">
              <AvatarImage
                src={getImageUrl(course.image)}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                {getInitials(course.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Name:</span>
                {isEditing && canEditGeneralInfo ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="h-8 font-bold max-w-md"
                  />
                ) : (
                  <span className="text-xl font-bold">{course.name}</span>
                )}
              </div>
              {!isEditing && <StatusBadge status={course.status} />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Start Date</Label>
            {isEditing && canEditGeneralInfo ? (
              <Input
                type="date"
                value={editForm.start_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, start_date: e.target.value })
                }
              />
            ) : (
              <div className="font-medium">
                {dayjs(course.start_date).format("DD/MM/YYYY")}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Finish Date</Label>
            {isEditing && canEditGeneralInfo ? (
              <Input
                type="date"
                value={editForm.finish_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, finish_date: e.target.value })
                }
              />
            ) : (
              <div className="font-medium">
                {dayjs(course.finish_date).format("DD/MM/YYYY")}
              </div>
            )}
          </div>

          {/* CATEGORIES: Hiển thị Categories dạng Read-only (Badges) cho cả Supervisor */}
          <div className="col-span-2 space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {course.categories && course.categories.length > 0 ? (
                course.categories.map((c: any) => (
                  <Badge key={c.id} variant="secondary">
                    {c.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No categories assigned
                </span>
              )}
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Link</Label>
            {isEditing && canEditGeneralInfo ? (
              <Input
                value={editForm.link_to_course}
                onChange={(e) =>
                  setEditForm({ ...editForm, link_to_course: e.target.value })
                }
              />
            ) : (
              <a
                href={course.link_to_course || "#"}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {course.link_to_course || "N/A"}
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Các phần Tabs giữ nguyên */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects" className="cursor-pointer">
            <BookOpen className="h-4 w-4 mr-2" /> Curriculum
          </TabsTrigger>
          <TabsTrigger value="people" className="cursor-pointer">
            <Users className="h-4 w-4 mr-2" /> People
          </TabsTrigger>
        </TabsList>
        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Management</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                /* Chế độ chỉnh sửa: Dùng component cũ */
                <SubjectsTab
                  courseId={courseId}
                  isEditing={isEditing}
                  role={role}
                  setConfirmModal={setConfirmModal}
                />
              ) : (
                /* Chế độ xem: Hiển thị danh sách tĩnh có nút Detail */
                <div className="space-y-3">
                  {/* FIX LỖI TS: Ép kiểu (course as any) để truy cập course_subjects */}
                  {(course as any)?.course_subjects &&
                  (course as any).course_subjects.length > 0 ? (
                    (course as any).course_subjects
                      // Sắp xếp theo position
                      .sort(
                        (a: any, b: any) =>
                          (a.position || 0) - (b.position || 0)
                      )
                      .map((item: any, index: number) => (
                        <div
                          key={item.id}
                          className="flex items-center p-4 gap-4 border rounded-lg hover:border-primary/40 transition-colors bg-card"
                        >
                          {/* Cột 1: Index Badge */}
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                              {index + 1}
                            </div>
                          </div>

                          {/* Cột 2: Thông tin Subject */}
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                              <h4 className="font-semibold text-base truncate">
                                {item.subject?.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{" "}
                                  {item.subject?.estimated_time_days || 0} days
                                </span>
                                <span>•</span>
                                <span>
                                  {item.subject?.tasks?.length || 0} tasks
                                </span>
                              </div>
                            </div>

                            {/* Cột 3: Ngày tháng */}
                            <div className="hidden md:block text-xs text-muted-foreground text-right">
                              <div>
                                Start:{" "}
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD/MM/YYYY")
                                  : "--"}
                              </div>
                              <div>
                                End:{" "}
                                {item.finish_date
                                  ? dayjs(item.finish_date).format("DD/MM/YYYY")
                                  : "--"}
                              </div>
                            </div>
                          </div>

                          {/* Cột 4: Nút Detail (MỚI) */}
                          <div className="shrink-0 pl-2 border-l ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:bg-primary/10 hover:text-primary cursor-pointer"
                              title="View Subject Details"
                              onClick={() =>
                                router.push(
                                  `/supervisor/courses/${courseId}/subject/${item.id}`
                                )
                              }
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic border border-dashed rounded-md">
                      No subjects added yet.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="people" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <PeopleList
                  title="Trainers"
                  type="Supervisor"
                  data={supervisorList}
                  onAdd={handleAddSupervisor}
                  canEdit={canManageSupervisors}
                  onDeleteClick={(id) => confirmDeletePerson(id, "Supervisor")}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <PeopleList
                  title="Trainees"
                  type="Trainee"
                  data={trainees}
                  onAdd={handleAddTrainee}
                  canEdit={true}
                  onDeleteClick={(id) => confirmDeletePerson(id, "Trainee")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isEditing && canEditGeneralInfo && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-4 shadow-lg z-20">
          <div className="container max-w-5xl flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mr-2 cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="cursor-pointer">
              <Save className="mr-2 h-4 w-4 cursor-pointer" /> Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Modal giữ nguyên */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) =>
          !open && setConfirmModal({ ...confirmModal, isOpen: false })
        }
      >
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> {confirmModal.title}
            </DialogTitle>
            <DialogDescription>{confirmModal.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() =>
                setConfirmModal({ ...confirmModal, isOpen: false })
              }
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
              className="cursor-pointer"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
