"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  GripVertical,
  Search,
  Pencil,
  Trash2,
  Plus,
  UserPlus,
  Loader2,
  Save,
  X,
  BookOpen,
  Users,
  AlertCircle,
} from "lucide-react";

// APIs & Libs
import {
  adminApi,
  AdminCourseDetail,
  AdminCourseSubject,
} from "@/lib/adminApi";
import { userApi } from "@/lib/userApi";
import axiosClient from "@/lib/axiosClient";
import { User } from "@/types/user";
import dayjs from "dayjs";
// [UX] Import Toast và Toaster để cấu hình vị trí
import { toast, Toaster } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- TYPES ---
type UserRole = "ADMIN" | "SUPERVISOR" | "TRAINEE";
type EditableSubjectField =
  | "estimated_time_days"
  | "name"
  | "start_date"
  | "finish_date";

interface CourseEditForm {
  name: string;
  start_date: string;
  finish_date: string;
  link_to_course: string;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

// --- HELPERS ---
const getInitials = (name: string) => {
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
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendUrl}${cleanPath}`;
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

// --- DYNAMIC API HELPER ---
const getDynamicApi = (role: UserRole) => {
  const prefix = role === "ADMIN" ? "/api/admin" : "/api/supervisor";
  return {
    getDetail: (id: number) => axiosClient.get(`${prefix}/courses/${id}/`),
    updateCourse: (id: number, data: any) =>
      axiosClient.patch(`${prefix}/courses/${id}/update/`, data),
    getTrainees: (id: number) =>
      role === "ADMIN"
        ? axiosClient.get(`${prefix}/courses/${id}/trainees/`)
        : axiosClient.get(`${prefix}/courses/${id}/students/`),
    addTrainees: (id: number, ids: number[]) =>
      axiosClient.post(`${prefix}/courses/${id}/add-trainees/`, {
        trainee_ids: ids,
      }),
    removeTrainee: (id: number, userId: number) =>
      axiosClient.delete(`${prefix}/courses/${id}/remove-trainee/`, {
        data: { id: userId },
      }),
    addSupervisors: (id: number, ids: number[]) =>
      axiosClient.post(`${prefix}/courses/${id}/add-supervisors/`, {
        supervisor_ids: ids,
      }),
    removeSupervisor: (id: number, userId: number) =>
      axiosClient.delete(`${prefix}/courses/${id}/remove-supervisor/`, {
        data: { id: userId },
      }),
    getSubjects: (id: number) =>
      axiosClient.get(`${prefix}/courses/${id}/subjects/`),
    addSubject: (id: number, data: any) =>
      axiosClient.post(`${prefix}/courses/${id}/add-subject/`, data),
    removeSubject: (id: number, subId: number) =>
      axiosClient.delete(`${prefix}/courses/${id}/remove-subject/`, {
        data: { id: subId },
      }),
    updateCourseSubject: (id: number, data: any) =>
      axiosClient.patch(`/api/admin/course-subjects/${id}/`, data),
    reorderSubjects: (id: number, items: any) =>
      axiosClient.post(`${prefix}/courses/${id}/reorder-subjects/`, { items }),
    addTask: (id: number, csId: number, name: string) =>
      axiosClient.post(`${prefix}/courses/${id}/add-task/`, {
        course_subject_id: csId,
        name,
      }),
    updateTask: (taskId: number, name: string) =>
      axiosClient.patch(`${prefix}/tasks/${taskId}/detail/`, { name }),
    deleteTask: (taskId: number) =>
      axiosClient.delete(`${prefix}/tasks/${taskId}/detail/`),
  };
};

// --- COMPONENT: USER SEARCH ---
const UserSearchDialog = ({
  isOpen,
  onClose,
  onSelect,
  type,
  excludeIds = [],
}: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAllUsers = async () => {
        setIsSearching(true);
        try {
          const res = await userApi.getAll();
          const data =
            (res.data as any).data || (res.data as any).results || res.data;
          const safeData = Array.isArray(data) ? data : [];
          setSearchResults(safeData.filter((u) => !excludeIds.includes(u.id)));
        } catch (error) {
          console.error("Failed to fetch users", error);
        } finally {
          setIsSearching(false);
        }
      };
      fetchAllUsers();
    }
  }, [isOpen]);

  const filteredResults = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    const targetRole = type.toUpperCase();
    return searchResults.filter(
      (u) =>
        (!u.role || u.role === targetRole) &&
        (u.full_name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower))
    );
  }, [searchTerm, searchResults, type]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] z-[100]">
        <DialogHeader>
          <DialogTitle>
            Add {type === "Supervisor" ? "Trainer" : type}
          </DialogTitle>
          <DialogDescription>Search by name or email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button disabled={isSearching} variant="ghost" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-[200px] border border-border rounded-md p-2">
            {filteredResults.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex justify-between items-center p-2 hover:bg-accent rounded-md border border-transparent hover:border-border"
                  >
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onSelect(u.id);
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- COMPONENT: PEOPLE LIST ---
const PeopleList = ({
  title,
  data,
  onAdd,
  onDeleteClick,
  type,
  canEdit,
}: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {title} ({data.length})
        </h3>
        {canEdit && (
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add{" "}
            {type === "Supervisor" ? "Trainer" : type}
          </Button>
        )}
        <UserSearchDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSelect={onAdd}
          type={type}
          excludeIds={data.map((u: any) => u.id)}
        />
      </div>

      <div className="border border-border rounded-md divide-y divide-border bg-card">
        {data.map((user: User) => (
          <div
            key={user.id}
            className="p-3 flex justify-between items-center hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(user.full_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {user.full_name || "No Name"}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
                onClick={() => onDeleteClick(user.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No {title.toLowerCase()} added.
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: SUBJECTS TAB ---
const SubjectsTab = ({
  courseId,
  isEditing,
  api,
  setConfirmModal,
}: {
  courseId: number;
  isEditing: boolean;
  api: any;
  setConfirmModal: any;
}) => {
  const [subjects, setSubjects] = useState<AdminCourseSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDays, setNewSubjectDays] = useState(1);

  const fetchSubjects = async () => {
    try {
      const res = await api.getSubjects(courseId);
      const data =
        (res.data as any).data || (res.data as any).results || res.data;
      if (Array.isArray(data))
        setSubjects(data.sort((a: any, b: any) => a.position - b.position));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  const handleAddSubject = async () => {
    try {
      if (!newSubjectName) return;
      await api.addSubject(courseId, {
        name: newSubjectName,
        estimated_time_days: newSubjectDays,
        tasks: ["Introduction"],
      });
      toast.success("Subject added successfully");
      setIsAddDialogOpen(false);
      setNewSubjectName("");
      fetchSubjects();
    } catch (error) {
      toast.error("Failed to add subject");
    }
  };

  const handleUpdate = async (
    id: number,
    field: EditableSubjectField,
    value: string | number
  ) => {
    if (!isEditing) return;
    try {
      await api.updateCourseSubject(id, { [field]: value });
      toast.success("Saved changes");
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  const handleLocalChange = (id: number, field: string, value: any) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentSubject = s.subject || {
            id: 0,
            name: "",
            tasks: [],
            estimated_time_days: 0,
          };
          if (field === "name")
            return {
              ...s,
              subject: { ...currentSubject, name: String(value) },
            };
          if (field === "estimated_time_days")
            return {
              ...s,
              subject: {
                ...currentSubject,
                estimated_time_days: Number(value),
              },
            };
          return { ...s, [field]: value } as AdminCourseSubject;
        }
        return s;
      })
    );
  };

  const handleAddTask = async (csId: number, taskName: string) => {
    try {
      await api.addTask(courseId, csId, taskName);
      toast.success("Task added");
      fetchSubjects();
    } catch (e) {
      toast.error("Failed to add task");
    }
  };

  const handleEditTask = async (taskId: number, currentName: string) => {
    const newName = prompt("Rename task:", currentName);
    if (newName && newName !== currentName) {
      try {
        await api.updateTask(taskId, newName);
        toast.success("Task updated");
        fetchSubjects();
      } catch (error) {
        toast.error("Failed to update task");
      }
    }
  };

  const executeDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      toast.success("Task deleted");
      fetchSubjects();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const executeDeleteSubject = async (csId: number) => {
    try {
      await api.removeSubject(courseId, csId);
      toast.success("Subject removed");
      setSubjects((prev) => prev.filter((s) => s.id !== csId));
    } catch (e) {
      toast.error("Failed to remove subject");
    }
  };

  const confirmDeleteTask = (taskId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Task?",
      description: "This action cannot be undone.",
      onConfirm: () => executeDeleteTask(taskId),
    });
  };

  const confirmDeleteSubject = (csId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Subject?",
      description: "This will remove the subject from this course.",
      onConfirm: () => executeDeleteSubject(csId),
    });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !isEditing) return;
    const items = Array.from(subjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    setSubjects(updatedItems);

    try {
      await api.reorderSubjects(
        courseId,
        updatedItems.map((i) => ({ id: i.id, position: i.position }))
      );
      toast.success("Order saved");
    } catch (error) {
      toast.error("Failed to save order");
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading curriculum...
      </div>
    );

  return (
    <div className="space-y-4 pb-20">
      {isEditing && (
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="z-[100]">
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g. React Basics"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Est. Days</Label>
                  <Input
                    type="number"
                    value={newSubjectDays}
                    onChange={(e) => setNewSubjectDays(Number(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSubject}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="border border-border rounded-md bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 font-semibold text-muted-foreground text-sm border-b border-border">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Subject & Tasks</div>
          <div className="col-span-3">Timeline (Start - End)</div>
          <div className="col-span-2 text-center">Est. Days</div>
          <div className="col-span-1"></div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="subjects-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="divide-y divide-border"
              >
                {subjects.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id.toString()}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`grid grid-cols-12 gap-2 p-3 items-start ${
                          snapshot.isDragging
                            ? "bg-accent shadow-lg"
                            : "hover:bg-muted/30 bg-card"
                        }`}
                      >
                        <div className="col-span-1 pt-2 text-center">
                          {isEditing ? (
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab"
                            >
                              <GripVertical className="w-5 h-5 mx-auto text-muted-foreground" />
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="col-span-5 space-y-2">
                          <div className="font-bold text-sm">
                            {isEditing ? (
                              <Input
                                value={item.subject?.name}
                                onChange={(e) =>
                                  handleLocalChange(
                                    item.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="h-8 font-bold"
                              />
                            ) : (
                              item.subject?.name
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground pl-1">
                            {item.subject?.tasks?.length || 0} tasks
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 ml-2 p-0 text-primary"
                                onClick={() => {
                                  const t = prompt("Task name:");
                                  if (t) handleAddTask(item.id, t);
                                }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <div className="mt-1 pl-2 border-l-2 border-muted space-y-1">
                            {item.subject?.tasks?.map((t) => (
                              <div
                                key={t.id}
                                className="group flex justify-between text-sm py-0.5 px-2 hover:bg-muted rounded"
                              >
                                <span>- {t.name}</span>
                                {isEditing && (
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                    <Pencil
                                      className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-primary"
                                      onClick={() =>
                                        handleEditTask(t.id, t.name)
                                      }
                                    />
                                    <Trash2
                                      className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-destructive"
                                      onClick={() => confirmDeleteTask(t.id)}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">
                              Start
                            </span>
                            {isEditing ? (
                              <Input
                                type="date"
                                className="h-7 text-xs"
                                value={item.start_date || ""}
                                onChange={(e) =>
                                  handleLocalChange(
                                    item.id,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleUpdate(
                                    item.id,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              <span className="text-sm">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD/MM/YYYY")
                                  : "--"}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">
                              End
                            </span>
                            {isEditing ? (
                              <Input
                                type="date"
                                className="h-7 text-xs"
                                value={item.finish_date || ""}
                                onChange={(e) =>
                                  handleLocalChange(
                                    item.id,
                                    "finish_date",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleUpdate(
                                    item.id,
                                    "finish_date",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              <span className="text-sm">
                                {item.finish_date
                                  ? dayjs(item.finish_date).format("DD/MM/YYYY")
                                  : "--"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-2 text-center pt-1">
                          {isEditing ? (
                            <div className="flex flex-col items-center">
                              <Input
                                type="number"
                                className="h-8 w-16 text-center"
                                value={item.subject?.estimated_time_days}
                                onChange={(e) =>
                                  handleLocalChange(
                                    item.id,
                                    "estimated_time_days",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) =>
                                  handleUpdate(
                                    item.id,
                                    "estimated_time_days",
                                    e.target.value
                                  )
                                }
                              />
                              <span className="text-[10px] text-muted-foreground">
                                days
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold bg-secondary px-2 py-1 rounded-full">
                              {item.subject?.estimated_time_days || 0} days
                            </span>
                          )}
                        </div>

                        <div className="col-span-1 pt-2 text-right">
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8 w-8"
                              onClick={() => confirmDeleteSubject(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {subjects.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No subjects added.
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
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

  const api = useMemo(() => getDynamicApi(role), [role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, traineesRes] = await Promise.all([
        api.getDetail(courseId),
        api.getTrainees(courseId),
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
  }, [courseId, loadingRole, api]);

  useEffect(() => {
    if (searchParams.get("edit") === "true") setIsEditing(true);
  }, [searchParams]);

  const handleSave = async () => {
    try {
      await api.updateCourse(courseId, editForm);
      toast.success("Course updated");
      setIsEditing(false);
      fetchData();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const handleAddTrainee = async (uid: number) => {
    try {
      await api.addTrainees(courseId, [uid]);
      toast.success("Trainee added");
      fetchData();
    } catch (e) {
      toast.error("Failed to add trainee");
    }
  };

  const handleRemoveTrainee = async (uid: number) => {
    try {
      await api.removeTrainee(courseId, uid);
      toast.success("Trainee removed");
      setTrainees((p) => p.filter((t) => t.id !== uid));
    } catch (e) {
      toast.error("Failed to remove trainee");
    }
  };

  const handleAddSupervisor = async (uid: number) => {
    try {
      await api.addSupervisors(courseId, [uid]);
      toast.success("Supervisor added");
      fetchData();
    } catch (e) {
      toast.error("Failed to add supervisor");
    }
  };

  const handleRemoveSupervisor = async (uid: number) => {
    try {
      await api.removeSupervisor(courseId, uid);
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
      {/* [FIX] TOASTER CONFIG - Hiện thông báo ở trên cùng */}
      <Toaster position="top-center" richColors />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Detail</h1>
        <Button
          variant={isEditing ? "destructive" : "default"}
          onClick={() => setIsEditing(!isEditing)}
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
                href={course.link_to_course}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {course.link_to_course || "N/A"}
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" /> Subjects
          </TabsTrigger>
          <TabsTrigger value="people">
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
                api={api}
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
                  onDeleteClick={(id: number) =>
                    confirmDeletePerson(id, "Supervisor")
                  }
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
                  onDeleteClick={(id: number) =>
                    confirmDeletePerson(id, "Trainee")
                  }
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
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) =>
          !open && setConfirmModal({ ...confirmModal, isOpen: false })
        }
      >
        <DialogContent className="z-[100]">
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
