"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";

type ToggleStatusFn = (user: User) => void;

export const columns = (toggleStatus: ToggleStatusFn) => {
  const cols: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
    },

    { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Họ tên" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Vai trò" },

    {
      accessorKey: "is_active",
      header: "Trạng thái",
      cell: ({ row }) => {
        const active = row.original.is_active;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              active
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {active ? "Hoạt động" : "Đã khóa"}
          </span>
        );
      },
    },

    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button
            variant="ghost"
            onClick={() => toggleStatus(user)}
            className={user.is_active ? "text-yellow-600" : "text-green-600"}
          >
            {user.is_active ? "Khóa" : "Mở khóa"}
          </Button>
        );
      },
    },
  ];

  return cols;
};
