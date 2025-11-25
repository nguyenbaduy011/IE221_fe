/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  X,
  Pencil,
  BookOpen,
  Users,
  AlertCircle,
  ArrowLeft, // 1. Import thêm icon ArrowLeft
} from "lucide-react";
import dayjs from "dayjs";
import { toast, Toaster } from "sonner";

import axiosClient from "@/lib/axiosClient";
import { courseApi } from "@/lib/courseApi";
import { AdminCourseDetail } from "@/lib/adminApi";
import { User } from "@/types/user";
import { UserRole, CourseEditForm, ConfirmModalState } from "@/types/course";

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

// Import các components con đã tách
import { PeopleList } from "@/components/PeopleList";
import { SubjectsTab } from "@/components/SubjectsTab";
import { BackButton } from "@/components/ui/back-button";

// --- HELPERS ---
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border"
        >
          Not Started
        </Badge>
      );
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

export default function AdminCourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [role, setRole] = useState<UserRole>("TRAINEE");
  const [loadingRole, setLoadingRole] = useState(true);
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [trainees, setTrainees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subjects");
  const [isEditing, setIsEditing] = useState(false);

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
  });

  // Check Auth Role
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await axiosClient.get("/auth/me/");
        const user = (res.data as any).data || res.data;
        if (user && user.role) setRole(user.role);
      } catch (error) {
        toast.error("Authentication failed");
      } finally {
        setLoadingRole(false);
      }
    };
    checkRole();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, traineesRes] = await Promise.all([
        courseApi.getDetail(courseId, role),
        courseApi.getTrainees(courseId, role),
      ]);

      const courseData = (courseRes.data as any).data || courseRes.data;
      if (!courseData.supervisors && courseData.members?.trainers) {
        courseData.supervisors = courseData.members.trainers.list.map(
          (t: any) => ({ id: Math.random(), supervisor: t })
        );
      }
      setCourse(courseData);

      const traineesData =
        (traineesRes.data as any).data ||
        (traineesRes.data as any).results ||
        traineesRes.data;
      setTrainees(Array.isArray(traineesData) ? traineesData : []);

      setEditForm({
        name: courseData.name || "",
        start_date: courseData.start_date || "",
        finish_date: courseData.finish_date || "",
        link_to_course: courseData.link_to_course || "",
      });
    } catch (error) {
      toast.error("Failed to load data or access denied");
      if (role === "SUPERVISOR") router.push("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingRole && courseId) fetchData();
  }, [courseId, loadingRole, role]);

  useEffect(() => {
    if (searchParams.get("edit") === "true") setIsEditing(true);
  }, [searchParams]);

  const handleSave = async () => {
    try {
      await courseApi.updateCourse(courseId, editForm, role);
      toast.success("Course updated");
      setIsEditing(false);
      fetchData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

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
    } catch (e) {
      toast.error("Failed to remove supervisor");
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

  const handleBack = () => {
    const path =
      role === "SUPERVISOR" ? "/supervisor/courses" : "/admin/courses";
    router.push(path);
  };

  if (loading || loadingRole)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

  const supervisorList =
    course.supervisors?.map((s: any) => s.supervisor || s) || [];
  const canManageSupervisors = role === "ADMIN";

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 pb-24">
      <Toaster position="top-center" richColors />

      <BackButton />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Detail</h1>
        <Button
          variant={isEditing ? "destructive" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" /> Edit Course
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
                {isEditing ? (
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
            {isEditing ? (
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
            {isEditing ? (
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
          <div className="col-span-2 space-y-2">
            <Label>Link</Label>
            {isEditing ? (
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

      {/* TABS AREA */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects" className="cursor-pointer">
            <BookOpen className="h-4 w-4 mr-2" /> Subjects
          </TabsTrigger>
          <TabsTrigger value="people" className="cursor-pointer">
            <Users className="h-4 w-4 mr-2" /> People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectsTab
                courseId={courseId}
                isEditing={isEditing}
                role={role}
                setConfirmModal={setConfirmModal}
              />
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

      {isEditing && (
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

      {/* CONFIRMATION MODAL */}
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
