"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Search } from "lucide-react";
import {
  adminApi,
  AdminCourseDetail,
  AdminCourseSubject,
  Subject, // Import Interface Subject gốc
} from "@/lib/adminApi";
import { userApi } from "@/lib/userApi";
import { User } from "@/types/user";
import dayjs from "dayjs";

// Import UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Icons
import {
  Loader2,
  Save,
  Edit,
  X,
  Users,
  BookOpen,
  Trash2,
  Plus,
  UserPlus,
} from "lucide-react";

// --- TYPES ---
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

// --- COMPONENT: USER SEARCH DIALOG (CLIENT-SIDE FILTERING) ---
const UserSearchDialog = ({
  isOpen,
  onClose,
  onSelect,
  type,
  excludeIds = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
  type: "Supervisor" | "Trainee";
  excludeIds?: number[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // useEffect fetchAllUsers ... (Giữ nguyên code cũ của bạn)
  useEffect(() => {
    if (isOpen) {
      const fetchAllUsers = async () => {
        setIsSearching(true);
        try {
          const res = await userApi.getAll();
          const data =
            (res.data as any).data || (res.data as any).results || res.data;
          const safeData = Array.isArray(data) ? data : [];
          setAllUsers(safeData);
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

  // useEffect filter ... (Giữ nguyên code cũ của bạn)
  useEffect(() => {
    if (!allUsers.length) return;

    const lowerTerm = searchTerm.toLowerCase();
    const targetRole = type.toUpperCase();

    const filtered = allUsers.filter((user) => {
      const roleMatch = user.role ? user.role === targetRole : true;
      const nameMatch = user.full_name?.toLowerCase().includes(lowerTerm);
      const emailMatch = user.email?.toLowerCase().includes(lowerTerm);
      const notInCourse = !excludeIds.includes(user.id);

      return roleMatch && (nameMatch || emailMatch) && notInCourse;
    });

    setSearchResults(filtered);

    // QUAN TRỌNG: Thay `excludeIds` bằng `JSON.stringify(excludeIds)`
    // Điều này giúp React so sánh nội dung mảng "[1,2]" thay vì địa chỉ bộ nhớ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, allUsers, type, JSON.stringify(excludeIds)]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {/* --- PHẦN BỊ THIẾU CẦN THÊM VÀO --- */}
        <DialogHeader>
          <DialogTitle>Add {type}</DialogTitle>
          <DialogDescription>
            Search for a {type.toLowerCase()} by name or email.
          </DialogDescription>
        </DialogHeader>
        {/* ----------------------------------- */}

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button disabled={isSearching} variant="ghost" size="icon">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="h-[200px] border border-border rounded-md p-2">
            {searchResults.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {isSearching
                  ? "Loading users..."
                  : "No users found matching your criteria."}
              </p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md border border-transparent hover:border-border transition-colors"
                  >
                    <div className="overflow-hidden">
                      <p className="font-medium truncate text-foreground">
                        {u.full_name}
                      </p>
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
  onRemove,
  type,
}: {
  title: string;
  data: User[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  type: "Supervisor" | "Trainee";
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const safeData = Array.isArray(data) ? data : [];
  const existingIds = useMemo(() => {
    return safeData.map((user) => user.id);
  }, [safeData]); // Chỉ tính toán lại khi safeData thay đổi
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          {title} ({safeData.length})
        </h3>

        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add {type}
        </Button>

        <UserSearchDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSelect={onAdd}
          type={type}
          excludeIds={existingIds} // Truyền mảng đã được memoize
        />
      </div>

      <div className="border border-border rounded-md divide-y divide-border bg-card">
        {safeData.map((user) => (
          <div
            key={user.id}
            className="p-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium text-foreground">
                {user.full_name || "No Name"}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {user.id} • {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
              onClick={() => onRemove(user.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {safeData.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No {title} found.
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: SUBJECTS TAB ---
interface SubjectsTabProps {
  courseId: number;
  isEditing: boolean;
}

const SubjectsTab = ({ courseId, isEditing }: SubjectsTabProps) => {
  const [subjects, setSubjects] = useState<AdminCourseSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Dialog Add Subject
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<"create" | "existing">(
    "create"
  );

  // Form Create New
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDays, setNewSubjectDays] = useState(1);

  // Form Select Existing
  const [existingSubjects, setExistingSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [isAdding, setIsAdding] = useState(false);

  // 1. Hàm lấy dữ liệu subjects của course
  const fetchSubjects = async () => {
    try {
      const res = await adminApi.getCourseSubjects(courseId);
      let data = res.data;
      if (data && !Array.isArray(data)) {
        if ((data as any).results) data = (data as any).results;
        else if ((data as any).data) data = (data as any).data;
      }

      if (Array.isArray(data)) {
        setSubjects(data.sort((a, b) => a.position - b.position));
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId]);

  // 2. Hàm lấy danh sách Subject có sẵn (Debounce search)
  const fetchAllSubjects = async () => {
    try {
      const res = await adminApi.getAllSubjects({ search: searchTerm });
      const data =
        (res.data as any).data || (res.data as any).results || res.data;
      setExistingSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch available subjects", error);
    }
  };

  useEffect(() => {
    if (isAddDialogOpen && activeAddTab === "existing") {
      const timeoutId = setTimeout(() => {
        fetchAllSubjects();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, isAddDialogOpen, activeAddTab]);

  // 3. Xử lý Add Subject (Chung cho cả 2 tab)
  const handleAddSubject = async () => {
    setIsAdding(true);
    try {
      let payload = {};

      if (activeAddTab === "create") {
        if (!newSubjectName) return;
        payload = {
          name: newSubjectName,
          estimated_time_days: newSubjectDays,
          max_score: 10,
          tasks: ["Introduction Task"],
        };
      } else {
        if (!selectedSubjectId) return;
        payload = { subject_id: selectedSubjectId };
      }

      await adminApi.addSubject(courseId, payload);

      // Reset & Reload
      setIsAddDialogOpen(false);
      setNewSubjectName("");
      setNewSubjectDays(1);
      setSelectedSubjectId(null);
      setSearchTerm("");

      fetchSubjects();
    } catch (error) {
      alert("Failed to add subject");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  // 4. Xử lý Add Task
  const handleAddTask = async (csId: number, taskName: string) => {
    try {
      await adminApi.addTask(courseId, csId, taskName);
      fetchSubjects();
    } catch (e) {
      console.error(e);
      alert("Failed to add task");
    }
  };

  // 5. Xử lý Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (!isEditing) return;

    const items = Array.from(subjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setSubjects(updatedItems);

    const payload = updatedItems.map((item) => ({
      id: item.id,
      position: item.position,
    }));

    try {
      await adminApi.reorderSubjects(courseId, payload);
    } catch (error) {
      console.error("Failed to save order", error);
    }
  };

  const handleUpdate = async (
    id: number,
    field: EditableSubjectField,
    value: string | number
  ) => {
    if (!isEditing) return;
    try {
      await adminApi.updateCourseSubject(id, { [field]: value });
      console.log("Saved", field, value);
    } catch (error) {
      alert("Failed to save changes");
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

          if (field === "name") {
            return {
              ...s,
              subject: { ...currentSubject, name: String(value) },
            };
          }
          if (field === "estimated_time_days") {
            return {
              ...s,
              subject: {
                ...currentSubject,
                estimated_time_days: Number(value),
              },
            };
          }
          return { ...s, [field]: value } as AdminCourseSubject;
        }
        return s;
      })
    );
  };

  const handleDelete = async (csId: number) => {
    if (!window.confirm("Remove this subject?")) return;
    try {
      await adminApi.removeSubject(courseId, csId);
      setSubjects((prev) => prev.filter((s) => s.id !== csId));
    } catch (e) {
      alert("Error removing subject");
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading subjects...
      </div>
    );

  const safeSubjects = Array.isArray(subjects) ? subjects : [];

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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Subject</DialogTitle>
                <DialogDescription>
                  Add a new or existing subject.
                </DialogDescription>
              </DialogHeader>

              <Tabs
                defaultValue="create"
                value={activeAddTab}
                onValueChange={(v) => setActiveAddTab(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="create">Create New</TabsTrigger>
                  <TabsTrigger value="existing">Select Existing</TabsTrigger>
                </TabsList>

                {/* TAB 1: CREATE NEW */}
                <TabsContent value="create" className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="col-span-3 bg-background"
                      placeholder="e.g. Advanced React"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="days" className="text-right">
                      Est. Days
                    </Label>
                    <Input
                      id="days"
                      type="number"
                      value={newSubjectDays}
                      onChange={(e) =>
                        setNewSubjectDays(Number(e.target.value))
                      }
                      className="col-span-3 bg-background"
                    />
                  </div>
                </TabsContent>

                {/* TAB 2: SELECT EXISTING */}
                <TabsContent value="existing" className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Search existing subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-background"
                    />
                    <Button variant="secondary" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[200px] border border-border rounded-md p-1 bg-muted/20">
                    {existingSubjects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                        <span>No subjects found.</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {existingSubjects.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedSubjectId(sub.id)}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition-all ${
                              selectedSubjectId === sub.id
                                ? "bg-primary/10 border-primary"
                                : "hover:bg-accent border-transparent"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <p className="font-medium text-sm text-foreground truncate">
                                {sub.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {sub.estimated_time_days} days
                              </p>
                            </div>
                            {selectedSubjectId === sub.id && (
                              <Badge>Selected</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button onClick={handleAddSubject} disabled={isAdding}>
                  {isAdding && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {activeAddTab === "create" ? "Create & Add" : "Add Selected"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="border border-border rounded-md bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 font-semibold text-muted-foreground text-sm border-b border-border">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Subject & Tasks</div>
          <div className="col-span-3">Timeline</div>
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
                {safeSubjects.map((item, index) => (
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
                        className={`grid grid-cols-12 gap-2 p-3 items-start transition-colors ${
                          snapshot.isDragging
                            ? "bg-accent shadow-lg z-10 border border-border"
                            : "hover:bg-muted/30 bg-card"
                        }`}
                      >
                        <div className="col-span-1 flex flex-col items-center justify-center pt-2">
                          {isEditing ? (
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="col-span-5 space-y-2">
                          <div
                            className="font-bold text-sm truncate text-foreground"
                            title={item.subject?.name}
                          >
                            {item.subject?.name || "No Name"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground/80">
                                Tasks:{" "}
                              </span>
                              {isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-primary hover:text-primary/80"
                                  onClick={() => {
                                    const tName = prompt("Enter task name:");
                                    if (tName) handleAddTask(item.id, tName);
                                  }}
                                  title="Add Task"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            {item.subject?.tasks &&
                            item.subject.tasks.length > 0 ? (
                              <ul className="list-disc list-inside mt-1 space-y-0.5 pl-1">
                                {item.subject.tasks.map((t) => (
                                  <li key={t.id} className="truncate">
                                    {t.name}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="italic opacity-70">
                                No tasks available
                              </span>
                            )}
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
                                className="h-7 text-xs bg-background"
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
                              <span className="text-sm font-semibold text-foreground">
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
                                className="h-7 text-xs bg-background"
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
                              <span className="text-sm font-semibold text-foreground">
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
                                className="h-8 w-20 text-center bg-background"
                                value={item.subject?.estimated_time_days ?? 0}
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
                              <span className="text-[10px] text-muted-foreground mt-1">
                                days
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-secondary-foreground bg-secondary px-3 py-1 rounded-full">
                              {item.subject?.estimated_time_days ?? 0} days
                            </span>
                          )}
                        </div>

                        <div className="col-span-1 flex justify-end pt-2">
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 h-8 w-8 hover:bg-red-100/10 hover:text-red-600"
                              onClick={() => handleDelete(item.id)}
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

        {safeSubjects.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No subjects added to this course yet.
          </div>
        )}
      </div>
    </div>
  );
};

// --- 4. MAIN PAGE ---
export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [trainees, setTrainees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"subjects" | "people">("subjects");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CourseEditForm>({
    name: "",
    start_date: "",
    finish_date: "",
    link_to_course: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, traineesRes] = await Promise.all([
        adminApi.getCourseDetail(courseId),
        adminApi.getTrainees(courseId),
      ]);

      // --- XỬ LÝ DATA KHÓA HỌC ---
      const courseBody = courseRes.data as any;
      let actualCourseData = courseBody;
      // Nếu có wrapper 'data', lấy ruột bên trong
      if (courseBody && courseBody.data && !courseBody.id) {
        actualCourseData = courseBody.data;
      }
      setCourse(actualCourseData);

      // --- XỬ LÝ DATA TRAINEES ---
      const traineesBody = traineesRes.data as any;
      let actualTraineesData: User[] = [];

      if (Array.isArray(traineesBody)) {
        // Trường hợp 1: Trả về mảng [User, User]
        actualTraineesData = traineesBody;
      } else if (traineesBody && Array.isArray(traineesBody.data)) {
        // Trường hợp 2: Trả về { data: [User, User] } <--- Đây là case của bạn
        actualTraineesData = traineesBody.data;
      } else if (traineesBody && Array.isArray(traineesBody.results)) {
        // Trường hợp 3: Trả về { results: [User, User] }
        actualTraineesData = traineesBody.results;
      }

      setTrainees(actualTraineesData);

      // Set Form
      if (actualCourseData) {
        setEditForm({
          name: actualCourseData.name || "",
          start_date: actualCourseData.start_date || "",
          finish_date: actualCourseData.finish_date || "",
          link_to_course: actualCourseData.link_to_course || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const handleSaveCourseInfo = async () => {
    try {
      await adminApi.updateCourse(courseId, editForm);
      setIsEditing(false);
      fetchData();
      alert("Course updated successfully");
    } catch (error) {
      alert("Update failed");
    }
  };

  const handleAddTrainee = async (userId: number) => {
    try {
      await adminApi.addTrainees(courseId, [userId]);
      alert("Trainee added");
      const res = await adminApi.getTrainees(courseId);
      const data = res.data as any;
      let actualTraineesData: User[] = [];
      if (Array.isArray(data)) {
        actualTraineesData = data;
      } else if (data && Array.isArray(data.data)) {
        actualTraineesData = data.data;
      } else if (data && Array.isArray(data.results)) {
        actualTraineesData = data.results;
      }
      setTrainees(actualTraineesData);
    } catch (error) {
      alert("Failed to add trainee");
    }
  };

  const handleRemoveTrainee = async (userId: number) => {
    if (!window.confirm("Remove this trainee?")) return;
    try {
      await adminApi.removeTrainee(courseId, userId);
      setTrainees((prev) => prev.filter((t) => t.id !== userId));
    } catch (error) {
      alert("Failed to remove trainee");
    }
  };

  const handleAddSupervisor = async (userId: number) => {
    try {
      await adminApi.addSupervisors(courseId, [userId]);
      alert("Supervisor added");
      fetchData();
    } catch (error) {
      alert("Failed to add supervisor");
    }
  };

  const handleRemoveSupervisor = async (userId: number) => {
    if (!window.confirm("Remove this supervisor?")) return;
    try {
      await adminApi.removeSupervisor(courseId, userId);
      fetchData();
    } catch (error) {
      alert("Failed to remove supervisor");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin mr-2 text-primary" /> Loading...
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  const supervisorList = course.supervisors?.map((s) => s.supervisor) || [];

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Course Detail</h1>
        <Button
          variant={isEditing ? "destructive" : "default"}
          onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel Edit
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" /> Edit Course
            </>
          )}
        </Button>
      </div>

      {/* INFO CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Info:{" "}
            {isEditing ? (
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="max-w-md font-bold bg-background"
              />
            ) : (
              course.name
            )}
            {!isEditing && (
              <Badge variant={course.status === 1 ? "default" : "secondary"}>
                {course.status === 1 ? "Active" : "Not Started"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Start Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, start_date: e.target.value })
                  }
                  className="bg-background"
                />
              ) : (
                <div className="font-medium text-foreground">
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
                  className="bg-background"
                />
              ) : (
                <div className="font-medium text-foreground">
                  {dayjs(course.finish_date).format("DD/MM/YYYY")}
                </div>
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Course Link</Label>
              {isEditing ? (
                <Input
                  value={editForm.link_to_course}
                  onChange={(e) =>
                    setEditForm({ ...editForm, link_to_course: e.target.value })
                  }
                  className="bg-background"
                />
              ) : (
                <a
                  href={course.link_to_course || "#"}
                  target="_blank"
                  className="block text-blue-600 hover:underline truncate"
                >
                  {course.link_to_course || "N/A"}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <div className="w-full">
        <div className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "subjects"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4" /> Subjects
            </div>
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "people"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" /> Supervisors & Trainees
            </div>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "subjects" && (
          <Card>
            <CardHeader>
              <CardTitle>Subject Management</CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectsTab courseId={courseId} isEditing={isEditing} />
            </CardContent>
          </Card>
        )}

        {activeTab === "people" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <PeopleList
                  title="Supervisors"
                  type="Supervisor"
                  data={supervisorList}
                  onAdd={handleAddSupervisor}
                  onRemove={handleRemoveSupervisor}
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
                  onRemove={handleRemoveTrainee}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* FLOATING SAVE BUTTON (CHỈ HIỆN KHI EDITING) */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-end gap-4 shadow-lg z-50">
          <div className="container max-w-5xl flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCourseInfo}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
