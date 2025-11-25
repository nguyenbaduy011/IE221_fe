"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserDetailDialog } from "@/components/UserDetailDialog";
import { Mail, Shield, CheckCircle2, XCircle } from "lucide-react";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import dayjs from "dayjs";

export const getColumns = (
  onToggleStatus: (user: User) => void,
  onEdit: (user: User) => void,
  sessionUser: User | null
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        className="cursor-pointer"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const isSelf = sessionUser?.id === user.id;
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="cursor-pointer"
          disabled={isSelf || false}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },

  {
    accessorKey: "id",
    header: "ID",
    size: 60,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {`UID-${String(row.original.id).padStart(6, "0")}`}
      </span>
    ),
  },

  {
    accessorKey: "full_name",
    header: "Name",
    size: 160,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span
              className="block w-[180px] truncate overflow-hidden whitespace-nowrap cursor-pointer font-semibold text-sm text-foreground hover:text-primary transition-colors"
              title={user.full_name}
            >
              {user.full_name}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 p-0 border border-border/50 shadow-lg">
            <div className="bg-background p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
                  Full Name
                </p>
                <p className="text-sm font-semibold text-foreground wrap-break-word">
                  {user.full_name}
                </p>
              </div>
              <div className="border-t border-border/30 pt-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1">
                  Role
                </p>
                <p className="text-sm text-foreground/80 font-medium">
                  {user.role}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },

  {
    accessorKey: "email",
    header: "Contact",
    size: 200,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span
                className="w-[200px] truncate overflow-hidden whitespace-nowrap text-sm text-primary hover:opacity-80 transition-opacity font-medium"
                title={user.email}
              >
                {user.email}
              </span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-0 border border-border/50 shadow-lg">
            <div className="bg-background p-4 space-y-4">
              <div className="space-y-3">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1.5">

                    Email
                  </p>
                  <p className="text-sm font-semibold break-all text-foreground">

                    {user.email}
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3">

                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1.5">

                    Joined
                  </p>
                  <p className="text-sm text-foreground/80">

                    {dayjs(user.date_joined).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3">

                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1.5">

                    Gender
                  </p>
                  <p className="text-sm text-foreground/80">

                    {user.gender === 1
                      ? "Male"
                      : user.gender === 2
                      ? "Female"
                      : "—"}
                  </p>
                </div>
                <div className="border-t border-border/30 pt-3">

                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-1.5">

                    Birthday
                  </p>
                  <p className="text-sm text-foreground/80">

                    {user.birthday
                      ? dayjs(user.birthday).format("DD/MM/YYYY")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },

  {
    accessorKey: "is_active",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <div className="flex items-center gap-2.5">
          {active ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span
            className={`text-xs font-semibold tracking-wide ${
              active
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "is_staff",
    header: "Permissions",
    size: 120,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">
          {row.original.is_staff ? (
            <span className="text-primary">Admin</span>
          ) : (
            <span className="text-muted-foreground">User</span>
          )}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    size: 240,
    cell: ({ row }) => {
      const user = row.original;
      const isSelf = sessionUser?.id === user.id;
      return (
        <div className="flex gap-2 justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
            disabled={isSelf || false}
            className={`text-xs font-medium transition-all duration-200 min-w-[90px] cursor-pointer ${
              user.is_active
                ? "hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:border-red-500/30"
                : "hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30"
            }`}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            disabled={isSelf || false}
            className="text-xs font-medium cursor-pointer"
          >
            Edit
          </Button>

          <UserDetailDialog user={user} />
        </div>
      );
    },
  },
];
