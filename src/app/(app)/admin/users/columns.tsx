"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Hàm trả về danh sách cột, nhận vào các action handler từ component cha
export const getColumns = (
  onToggleStatus: (user: User) => void,
  onEdit: (user: User) => void
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
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
        className="cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <span
          className={`inline-block w-20 text-center px-2 py-1 rounded-full text-xs font-semibold ${
            active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
            className={`min-w-[100px] transition-colors cursor-pointer ${
              user.is_active
                ? "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                : "text-green-600 border-green-600 hover:bg-green-50"
            }`}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="min-w-[90px] text-blue-600 border-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            Edit
          </Button>
        </div>
      );
    },
  },
];
