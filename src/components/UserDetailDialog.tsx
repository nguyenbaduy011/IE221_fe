"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { User } from "@/types/user";

export function UserDetailDialog({ user }: { user: User }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Full Name" value={user.full_name} />
          <InfoRow label="Role" value={user.role} />
          <InfoRow
            label="Birthday"
            value={user.birthday ? user.birthday : "—"}
          />
          <InfoRow
            label="Gender"
            value={
              user.gender === 1 ? "Male" : user.gender === 0 ? "Female" : "—"
            }
          />
          <InfoRow label="Active" value={user.is_active ? "Yes" : "No"} />
          <InfoRow label="Staff" value={user.is_staff ? "Yes" : "No"} />
          <InfoRow
            label="Joined At"
            value={new Date(user.date_joined).toLocaleString()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 pb-3 border-b last:border-b-0 last:pb-0">
      <span className="font-semibold text-slate-700 dark:text-gray-300">
        {label}
      </span>
      <span className="text-slate-600 dark:text-gray-50 text-right">
        {value}
      </span>
    </div>
  );
}
