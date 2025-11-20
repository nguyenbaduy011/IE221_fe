"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { UserDetailDialog } from "@/components/UserDetailDialog";

export const getSupervisorColumns = (
  onToggleStatus: (user: User) => void,
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
      const isSelf = sessionUser && sessionUser.id === user.id;
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
  },
  { accessorKey: "id", header: "ID", size: 50 },
  { accessorKey: "full_name", header: "Full Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <span
          className={`min-w-[90px] text-center inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${
            active
              ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
              : "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "is_staff",
    header: "Staff",
    cell: ({ row }) => (row.original.is_staff ? "Yes" : "No"),
  },
  {
    accessorKey: "date_joined",
    header: "Joined At",
    cell: ({ row }) =>
      dayjs(row.original.date_joined).format("DD/MM/YYYY HH:mm"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const isSelf = sessionUser && sessionUser.id === user.id;

      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
            disabled={isSelf || false}
            className={`cursor-pointer w-[100px] transition-colors ${
              user.is_active
                ? "hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                : "hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>

          <UserDetailDialog user={user} />
        </div>
      );
    },
  },
];
