"use client";

import { useState } from "react";
import { DailyReport } from "@//types/dailyReport";
import {
  Button,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@//components/ui";

type Props = {
  dailyReport?: DailyReport;
  courses: { id: number; name: string }[];
  onSubmit: (data: any) => void;
};

export default function DailyReportForm({
  dailyReport,
  courses,
  onSubmit,
}: Props) {
  const [courseId, setCourseId] = useState<number | "">(
    dailyReport?.course.id || ""
  );
  const [content, setContent] = useState(dailyReport?.content || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ courseId, content });
      }}
      className="space-y-6 bg-gray-800 p-6 rounded"
    >
      <div className="space-y-2">
        <Label htmlFor="course">Course</Label>
        <Select
          value={courseId}
          onValueChange={(val) => setCourseId(Number(val))}
        >
          <SelectTrigger id="course">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your daily report..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="secondary" value="draft">
          Save Draft
        </Button>
        <Button type="submit" variant="default" value="submitted">
          Submit
        </Button>
      </div>
    </form>
  );
}
