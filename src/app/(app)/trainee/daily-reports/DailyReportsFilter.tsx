"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FilterState } from "./DailyReportsClient";

type Course = { id: number; name: string };

type Props = {
  courses: Course[];
  currentFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
};

export default function DailyReportsFilter({
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
    const newFilter = { courseId: null, date: "" };
    setCourseId(null);
    setDate("");
    onFilterChange(newFilter);
  };

  return (
    <div className="bg-card text-card-foreground p-4 mb-6 rounded-xl shadow-lg border border-border">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-foreground">Course</label>
          <Select
            value={courseId !== null ? String(courseId) : "ALL"}
            onValueChange={(val) =>
              setCourseId(val === "ALL" ? null : Number(val))
            }
          >
            <SelectTrigger className="w-52 md:w-60">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="font-semibold">
                All Courses
              </SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-foreground">Date</label>
          <Input
            type="date"
            className="w-44"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="font-semibold cursor-pointer"
          >
            Apply Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="font-semibold cursor-pointer"
          >
            Reset
          </Button>
        </div>

        <Link href="/trainee/daily-reports/new" className="ml-auto">
          <Button
            type="button"
            variant="default"
            className="font-semibold cursor-pointer"
          >
            + Create New Report
          </Button>
        </Link>
      </form>
    </div>
  );
}
