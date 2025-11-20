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
    <div className="bg-white dark:bg-gray-900 p-5 mb-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-end gap-4"
      >
        <div className="w-full sm:w-auto flex-1 space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Course
          </label>

          <Select
            value={courseId !== null ? String(courseId) : "ALL"}
            onValueChange={(val) =>
              setCourseId(val === "ALL" ? null : Number(val))
            }
          >
            <SelectTrigger className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-blue-500">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>

            <SelectContent className="max-h-[200px] overflow-y-auto bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
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

        <div className="w-full sm:w-auto space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
            Date
          </label>
          <Input
            type="date"
            className="w-full sm:w-48 border-gray-300 dark:border-gray-700 focus:border-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 font-semibold transition flex-1 sm:flex-none"
          >
            Apply Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="font-semibold flex-1 sm:flex-none"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
