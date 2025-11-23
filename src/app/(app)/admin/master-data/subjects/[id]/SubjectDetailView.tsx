/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  subject: any;
}

export default function SubjectDetailView({ subject }: Props) {
  return (
    <div className="space-y-6">
      {/* Card 1: General Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Subject Name
              </label>
              <p className="text-lg font-semibold mt-1 text-foreground">
                {subject.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Estimated Duration
              </label>
              <p className="text-lg mt-1 text-foreground">
                {subject.estimated_time_days} days
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Max Score
              </label>
              <p className="text-lg mt-1 text-foreground">
                {subject.max_score}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Task List ({subject.tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {subject.tasks && subject.tasks.length > 0 ? (
            <ul className="space-y-2 border border-border rounded-md p-4 bg-muted/30">
              {subject.tasks.map((task: any, index: number) => (
                <li
                  key={task.id}
                  className="flex items-center p-3 bg-card border border-border rounded shadow-sm"
                >
                  <span className="font-bold text-muted-foreground w-8">
                    {index + 1}.
                  </span>
                  <span className="font-medium text-foreground">
                    {task.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              No tasks available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
