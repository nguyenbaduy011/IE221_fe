/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { SubjectFormValues } from "@/validations/subjectValidation";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTaskItemProps {
  field: any;
  index: number;
  control: Control<SubjectFormValues>;
  remove: (index: number) => void;
}

function SortableTaskItem({
  field,
  index,
  control,
  remove,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-background p-2 border border-border rounded-md shadow-sm group hover:border-primary/50 transition-colors mb-2"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-move touch-none p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
      >
        <GripVertical size={20} />
      </div>

      {/* Index Number */}
      <span className="font-bold text-muted-foreground w-6 text-center select-none">
        {index + 1}.
      </span>

      {/* Input */}
      <FormField
        control={control}
        name={`tasks.${index}.name`}
        render={({ field: inputField }) => (
          <FormItem className="flex-1 mb-0 space-y-0">
            <FormControl>
              <Input
                {...inputField}
                placeholder="Enter task name..."
                className="border-0 shadow-none focus-visible:ring-0 px-0 font-medium h-auto py-1 bg-transparent placeholder:text-muted-foreground/50"
                onKeyDown={handleKeyDown}
              />
            </FormControl>
            <FormMessage className="text-xs mt-1" />
          </FormItem>
        )}
      />

      {/* Delete Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-destructive/10 hover:text-destructive"
        onClick={() => remove(index)}
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface Props {
  control: Control<SubjectFormValues>;
}

export default function TaskListEditor({ control }: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "tasks",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);

      move(oldIndex, newIndex);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Task List</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {fields.map((field, index) => (
                <SortableTaskItem
                  key={field.id}
                  field={field}
                  index={index}
                  control={control}
                  remove={remove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary cursor-pointer h-12"
          onClick={() => append({ name: "", position: fields.length + 1 })}
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Task
        </Button>
      </CardContent>
    </Card>
  );
}
