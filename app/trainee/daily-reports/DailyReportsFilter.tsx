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

type Props = {
  courses: { id: number; name: string }[];
  onFilter: (courseId: number | null, date?: string) => void;
};

export default function DailyReportsFilter({ courses, onFilter }: Props) {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(courseId, date || undefined);
  };

  return (
    <div className="bg-gray-700 p-4 mb-4 rounded">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Select Course */}
        <Select
          value={courseId?.toString() ?? ""}
          onValueChange={(val) => setCourseId(val ? Number(val) : null)}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-44 bg-gray-800 text-white border-gray-600"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Button type="submit" className="bg-blue-600">
          Apply Filter
        </Button>

        <Link href="/trainee/daily-reports/new">
          <Button type="button" className="bg-green-600">
            Create Report
          </Button>
        </Link>
      </form>
    </div>
  );
}
