/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  subject: any;
}

export default function SubjectDetailView({ subject }: Props) {
  return (
    <div className="space-y-6">
      {/* Card 1: Thông tin chung */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin môn học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tên môn học</label>
              <p className="text-lg font-semibold mt-1">{subject.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Thời gian dự kiến</label>
              <p className="text-lg mt-1">{subject.estimated_time_days} ngày</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Điểm tối đa</label>
              <p className="text-lg mt-1">{subject.max_score}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Danh sách nhiệm vụ */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhiệm vụ ({subject.tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {subject.tasks && subject.tasks.length > 0 ? (
            <ul className="space-y-2 border rounded-md p-4 bg-gray-50">
              {subject.tasks.map((task: any, index: number) => (
                <li key={task.id} className="flex items-center p-3 bg-white border rounded shadow-sm">
                  <span className="font-bold text-muted-foreground w-8">{index + 1}.</span>
                  <span className="font-medium">{task.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic text-sm">Chưa có nhiệm vụ nào.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}