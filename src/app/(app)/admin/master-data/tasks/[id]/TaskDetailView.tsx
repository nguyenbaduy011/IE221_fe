/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  task: any;
}

export default function TaskDetailView({ task }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Tên Task</label>
          <p className="text-lg font-semibold">{task.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Tên môn học</label>
          <p className="text-lg">{task.subject_name || "---"}</p>
        </div>
      </CardContent>
    </Card>
  );
}