"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types/subject";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subjectApi } from "@/lib/subjectApi";

type Props = {
  task: Task;
  onUpdate: () => void;
  disabled?: boolean;
};

export default function TaskItem({ task, onUpdate, disabled = false }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleCheck = async (checked: boolean) => {
    try {
      const formData = new FormData();
      formData.append("status", checked ? "1" : "0");
      await subjectApi.updateTask(task.id, formData);
      onUpdate();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const handleHoursBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val) || val < 0) return;

    val = Math.round(val * 10) / 10;

    if (val !== task.spent_time) {
      try {
        const formData = new FormData();
        formData.append("spent_time", val.toString());
        await subjectApi.updateTask(task.id, formData);
        onUpdate();
      } catch {
        toast.error("Failed to update hours");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("submission_file", file);
      await subjectApi.updateTask(task.id, formData);
      toast.success("File uploaded successfully");
      onUpdate();
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={task.status === TaskStatus.DONE}
          onCheckedChange={handleCheck}
          disabled={disabled}
          className="w-5 h-5"
        />
        <span className={task.status === TaskStatus.DONE ? "line-through text-gray-500" : "font-medium"}>
          {task.name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Upload Button */}
        <div className="relative">
           <input
             type="file"
             id={`file-${task.id}`}
             className="hidden"
             onChange={handleFileChange}
             disabled={disabled || isUploading}
           />
           <label htmlFor={`file-${task.id}`}>
             <Button variant="outline" size="sm" className="cursor-pointer" asChild disabled={disabled || isUploading}>
                <span>
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2" />}
                    {task.submission_file ? "Re-upload" : "Upload File"}
                </span>
             </Button>
           </label>
        </div>

        {/* Link to file if exists */}
        {task.submission_file && (
            <a href={task.submission_file} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                <FileText className="w-5 h-5" />
            </a>
        )}

        {/* Hours Input */}
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Hours:</span>
            <Input
                type="number"
                step="0.1"
                defaultValue={task.spent_time ?? ""}
                onBlur={handleHoursBlur}
                disabled={disabled}
                className="w-20 h-9"
            />
        </div>
      </div>
    </div>
  );
}
