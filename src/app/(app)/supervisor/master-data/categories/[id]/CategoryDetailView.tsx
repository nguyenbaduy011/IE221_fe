/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  category: any;
}

export default function CategoryDetailView({ category }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin danh mục</CardTitle>
        </CardHeader>
        <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tên danh mục</label>
              <p className="text-xl font-semibold mt-1">{category.name}</p>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách môn học ({category.subject_categories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {category.subject_categories && category.subject_categories.length > 0 ? (
            <div className="border rounded-md divide-y">
              {category.subject_categories.map((item: any, index: number) => (
                <div key={item.id || index} className="p-4 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-6 w-6 flex items-center justify-center rounded-full">
                        {index + 1}
                    </Badge>
                    <span className="font-medium">{item.subject?.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                     {item.subject?.estimated_time_days} ngày
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Chưa có môn học nào trong danh mục này.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}