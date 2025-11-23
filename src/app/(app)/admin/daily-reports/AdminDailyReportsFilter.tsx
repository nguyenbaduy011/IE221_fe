"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterState } from "./AdminDailyReportsClient";
import { Course } from "@/types/course";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  courses: Course[];
  currentFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
};

export default function AdminDailyReportsFilter({
  courses,
  currentFilter,
  onFilterChange,
}: Props) {
  const [courseId, setCourseId] = useState<number | null>(
    currentFilter.courseId
  );
  const [date, setDate] = useState(currentFilter.date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      courseId: courseId,
      date: date,
    });
  };

  const handleReset = () => {
    setCourseId(null);
    setDate("");
    onFilterChange({ courseId: null, date: "" });
  };

  return (
    <div className="bg-card p-5 mb-6 rounded-xl shadow-sm border border-border">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-end gap-4"
      >
        {/* Course Select */}
        <div className="w-full sm:w-auto flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground">
            Select Course
          </label>

          <Select
            value={courseId !== null ? String(courseId) : "ALL"}
            onValueChange={(val) =>
              setCourseId(val === "ALL" ? null : Number(val))
            }
          >
            <SelectTrigger className="w-full bg-background border-input focus:ring-ring">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>

            <SelectContent className="max-h-[200px]">
              <SelectItem value="ALL" className="font-semibold cursor-pointer">
                All Courses
              </SelectItem>
              {courses.map((c) => (
                <SelectItem
                  key={c.id}
                  value={String(c.id)}
                  className="cursor-pointer"
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        <div className="w-full sm:w-auto space-y-2">
          <label className="text-sm font-medium text-foreground block">
            Date
          </label>
          <Input
            type="date"
            className="w-full sm:w-48 bg-background border-input focus:ring-ring"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            type="submit"
            className="flex-1 sm:flex-none font-semibold transition-all"
          >
            Apply Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-none font-semibold"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
