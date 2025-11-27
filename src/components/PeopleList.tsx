"use client";

import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserSearchDialog } from "./UserSearchDialog";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface PeopleListProps {
  title: string;
  data: User[];
  onAdd: (id: number) => void;
  onDeleteClick: (id: number) => void;
  type: string;
  canEdit: boolean;
}

export const PeopleList = ({
  title,
  data,
  onAdd,
  onDeleteClick,
  type,
  canEdit,
}: PeopleListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {title} ({data.length})
        </h3>
        {canEdit && (
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add{" "}
            {type === "Supervisor" ? "Trainer" : type}
          </Button>
        )}
        <UserSearchDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSelect={onAdd}
          type={type}
          excludeIds={data.map((u) => u.id)}
        />
      </div>

      <div className="border border-border rounded-md divide-y divide-border bg-card">
        {data.map((user) => (
          <div
            key={user.id}
            className="p-3 flex justify-between items-center hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(user.full_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {user.full_name || "No Name"}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-100/10 cursor-pointer"
                onClick={() => onDeleteClick(user.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No {title.toLowerCase()} added.
          </div>
        )}
      </div>
    </div>
  );
};
