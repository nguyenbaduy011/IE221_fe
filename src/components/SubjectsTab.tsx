/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Search,
  Loader2,
  Check,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { courseApi } from "@/lib/courseApi";
import { adminApi, Subject as AdminSubject } from "@/lib/adminApi"; // Import adminApi
import {
  AdminCourseSubject,
  UserRole,
  EditableSubjectField,
} from "@/types/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubjectsTabProps {
  courseId: number;
  isEditing: boolean;
  role: UserRole;
  setConfirmModal: any;
}

export const SubjectsTab = ({
  courseId,
  isEditing,
  role,
  setConfirmModal,
}: SubjectsTabProps) => {
  const [subjects, setSubjects] = useState<AdminCourseSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");

  // State Tab 1: Create New
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDays, setNewSubjectDays] = useState(1);

  // State Tab 2: Select Existing
  const [allSubjects, setAllSubjects] = useState<AdminSubject[]>([]);
  const [loadingAllSubjects, setLoadingAllSubjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );

  const fetchSubjects = async () => {
    try {
      const res = await courseApi.getSubjects(courseId, role);
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

  // Fetch tất cả môn học (cho Tab Existing)
  const fetchAllSubjects = async () => {
    try {
      setLoadingAllSubjects(true);
      const res = await adminApi.getAllSubjects();
      const data = (res.data as any).data || res.data;
      setAllSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load available subjects");
    } finally {
      setLoadingAllSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [courseId, role]);

  // Load danh sách môn học khi mở tab Existing
  useEffect(() => {
    if (
      isAddDialogOpen &&
      activeTab === "existing" &&
      allSubjects.length === 0
    ) {
      fetchAllSubjects();
    }
  }, [isAddDialogOpen, activeTab]);

  const handleAddSubject = async () => {
    try {
      let payload: any = {};

      if (activeTab === "existing") {
        if (!selectedSubjectId) {
          toast.error("Please select a subject");
          return;
        }
        payload = { subject_id: selectedSubjectId };
      } else {
        // Logic thêm môn MỚI
        if (!newSubjectName) {
          toast.error("Subject name is required");
          return;
        }
        payload = {
          name: newSubjectName,
          estimated_time_days: newSubjectDays,
          tasks: ["Introduction"],
        };
      }

      await courseApi.addSubject(courseId, payload, role);

      toast.success("Subject added successfully");
      setIsAddDialogOpen(false);

      // Reset form
      setNewSubjectName("");
      setNewSubjectDays(1);
      setSelectedSubjectId(null);
      setSearchTerm("");

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
      await courseApi.updateCourseSubject(id, { [field]: value });
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
      await courseApi.addTask(courseId, csId, taskName, role);
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
        await courseApi.updateTask(taskId, newName, role);
        toast.success("Task updated");
        fetchSubjects();
      } catch (error) {
        toast.error("Failed to update task");
      }
    }
  };

  const executeDeleteTask = async (taskId: number) => {
    try {
      await courseApi.deleteTask(taskId, role);
      toast.success("Task deleted");
      fetchSubjects();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const executeDeleteSubject = async (csId: number) => {
    try {
      await courseApi.removeSubject(courseId, csId, role);
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
      await courseApi.reorderSubjects(
        courseId,
        updatedItems.map((i) => ({ id: i.id, position: i.position })),
        role
      );
      toast.success("Order saved");
    } catch (error) {
      toast.error("Failed to save order");
    }
  };

  const existingSubjectIds = new Set(subjects.map((s: any) => s.subject?.id));
  const filteredSubjects = allSubjects.filter((sub) => {
    const matchesSearch = sub.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isNotAlreadyAdded = !existingSubjectIds.has(sub.id);
    return matchesSearch && isNotAlreadyAdded;
  });

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
            <DialogContent className="z-50 sm:max-w-[500px] max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add Subject to Course</DialogTitle>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={(v: any) => setActiveTab(v)}
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="new">Create New</TabsTrigger>
                  <TabsTrigger value="existing">Select Existing</TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="space-y-3">
                  <div className="grid gap-2">
                    <Label>
                      Name <span className="text-red-500">*</span>
                    </Label>
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
                      onChange={(e) =>
                        setNewSubjectDays(Number(e.target.value))
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="existing"
                  className="flex-1 flex flex-col min-h-0 space-y-3"
                >
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search existing subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex-1 border rounded-md relative bg-background min-h-[200px]">
                    {loadingAllSubjects ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : filteredSubjects.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                        No subjects found.
                      </div>
                    ) : (
                      <ScrollArea className="h-[250px] w-full p-2">
                        <div className="space-y-1">
                          {filteredSubjects.map((sub) => {
                            const isSelected = selectedSubjectId === sub.id;
                            return (
                              <div
                                key={sub.id}
                                onClick={() => setSelectedSubjectId(sub.id)}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm border border-transparent",
                                  isSelected
                                    ? "bg-primary/10 border-primary/20 text-primary font-medium"
                                    : "hover:bg-muted/60 text-foreground"
                                )}
                              >
                                <div className="flex flex-col">
                                  <span>{sub.name}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {sub.estimated_time_days} days • Max Score:{" "}
                                    {sub.max_score}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-2">
                <Button onClick={handleAddSubject}>
                  {activeTab === "existing" ? "Add Selected" : "Create"}
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
                                      className="w-3 h-3 cursor-pointer"
                                      onClick={() =>
                                        handleEditTask(t.id, t.name)
                                      }
                                    />
                                    <Trash2
                                      className="w-3 h-3 cursor-pointer text-destructive"
                                      onClick={() => confirmDeleteTask(t.id)}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 p-0 text-primary text-xs"
                                onClick={() => {
                                  const t = prompt("Task name:");
                                  if (t) handleAddTask(item.id, t);
                                }}
                              >
                                + Add Task
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col gap-2">
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

                        <div className="col-span-2 text-center pt-1">
                          {isEditing ? (
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
      </div>
    </div>
  );
};
