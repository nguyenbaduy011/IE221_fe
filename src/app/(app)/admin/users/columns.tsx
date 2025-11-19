"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import dayjs from "dayjs";
import { UserDetailDialog } from "@/components/UserDetailDialog";

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
          className={`w-[90px] text-center inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            active
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
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
    accessorKey: "birthday",
    header: "Birthday",
    cell: ({ row }) =>
      row.original.birthday
        ? dayjs(row.original.birthday).format("DD/MM/YYYY")
        : "—",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const g = row.original.gender;
      return g === 1 ? "Male" : g === 2 ? "Female" : "—";
    },
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
            className="cursor-pointer w-[100px]"
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            disabled={isSelf || false}
            className="cursor-pointer"
          >
            Edit
          </Button>
          <UserDetailDialog user={user} />
        </div>
      );
    },
  },
];
