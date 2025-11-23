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
        <CardTitle>Task Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Task Name
          </label>
          <p className="text-lg font-semibold text-foreground">{task.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Subject Name
          </label>
          <p className="text-lg text-foreground">
            {task.subject_name || "---"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
