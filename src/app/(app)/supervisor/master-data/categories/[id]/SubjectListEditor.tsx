/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFieldArray, Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { CategoryFormValues } from "@/validations/categoryValidation";

interface Props {
  control: Control<CategoryFormValues>;
  allSubjects: any[];
}

export default function SubjectListEditor({ control, allSubjects }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subject_categories",
  });

  const watchedSubjects = useWatch({
    control,
    name: "subject_categories",
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">
          Subject List <span className="text-destructive">*</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="subject_categories"
          render={({ fieldState }) =>
            fieldState.error ? (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {fieldState.error.message}
              </div>
            ) : (
              <></>
            )
          }
        />

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <span className="font-bold text-muted-foreground w-6 text-center">
                {index + 1}.
              </span>

              <FormField
                control={control}
                name={`subject_categories.${index}.subject_id`}
                render={({ field }) => (
                  <FormItem className="flex-1 mb-0">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a subject..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allSubjects.map((sub) => {
                          const subIdStr = sub.id.toString();

                          const isSelected = watchedSubjects?.some(
                            (item, idx) =>
                              item.subject_id === subIdStr && idx !== index
                          );

                          return (
                            <SelectItem
                              key={sub.id}
                              value={subIdStr}
                              disabled={isSelected}
                              className={isSelected ? "opacity-50" : ""}
                            >
                              {sub.name} {isSelected ? "(Selected)" : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary mt-2"
          onClick={() => append({ subject_id: "" })}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Subject
        </Button>
      </CardContent>
    </Card>
  );
}
