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
      {/* Card 1: General Info */}
      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Category Name
            </label>
            <p className="text-xl font-semibold mt-1 text-foreground">
              {category.name}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Subject List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Subject List ({category.subject_categories?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {category.subject_categories &&
          category.subject_categories.length > 0 ? (
            <div className="border border-border rounded-md divide-y divide-border bg-muted/20">
              {category.subject_categories.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className="p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="h-6 w-6 flex items-center justify-center rounded-full border-border text-muted-foreground"
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-foreground">
                      {item.subject?.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.subject?.estimated_time_days} days
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              No subjects found in this category.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
