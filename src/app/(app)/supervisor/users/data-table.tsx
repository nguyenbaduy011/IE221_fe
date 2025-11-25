"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";

import { User } from "@/types/user";
import { BulkActionConfirmDialog } from "@/components/BulkActionConfirmDialog";

export type SupervisorFilterState = {
  search: string;
  role: string;
  status: string;
};

interface SupervisorDataTableProps {
  columns: ColumnDef<User>[];
  data: User[];
  filter: SupervisorFilterState;
  setFilter: (f: SupervisorFilterState) => void;
  loading: boolean;
  onBulkDeactivate: (ids: number[]) => void;
  onBulkActivate: (ids: number[]) => void;
}

export function SupervisorDataTable({
  columns,
  data,
  filter,
  setFilter,
  loading,
  onBulkDeactivate,
  onBulkActivate,
}: SupervisorDataTableProps) {
  const table = useReactTable<User>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedUsers = selectedRows.map((row) => row.original as User);
  const selectedIds = selectedUsers.map((u) => u.id);

  const showBulkDeactivate =
    selectedUsers.length > 0 && selectedUsers.every((u) => u.is_active);
  const showBulkActivate =
    selectedUsers.length > 0 && selectedUsers.every((u) => !u.is_active);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogAction, setDialogAction] = React.useState<
    "activate" | "deactivate"
  >("activate");

  const handleBulkClick = (action: "activate" | "deactivate") => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (dialogAction === "activate") {
      onBulkActivate(selectedIds);
    } else {
      onBulkDeactivate(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 bg-muted/50 p-4 rounded-lg border border-border">
        <Input
          placeholder="Search by name or email..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="max-w-xs"
        />

        <Select
          value={filter.role}
          onValueChange={(v) => setFilter({ ...filter, role: v })}
        >
          <SelectTrigger className="w-40 cursor-pointer">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="cursor-pointer">
              All Roles
            </SelectItem>
            <SelectItem value="SUPERVISOR" className="cursor-pointer">
              SUPERVISOR
            </SelectItem>
            <SelectItem value="TRAINEE" className="cursor-pointer">
              TRAINEE
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.status}
          onValueChange={(v) => setFilter({ ...filter, status: v })}
        >
          <SelectTrigger className="w-40 cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="cursor-pointer">
              All Status
            </SelectItem>
            <SelectItem value="ACTIVE" className="cursor-pointer">
              Active
            </SelectItem>
            <SelectItem value="INACTIVE" className="cursor-pointer">
              Inactive
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          onClick={() => {
            setFilter({
              search: "",
              role: "ALL",
              status: "ALL",
            });
            table.resetRowSelection();
          }}
          className="cursor-pointer"
        >
          Reset
        </Button>

        {/* ACTION BUTTONS */}
        {showBulkDeactivate && (
          <Button
            variant="destructive"
            onClick={() => handleBulkClick("deactivate")}
            className="cursor-pointer ml-auto"
          >
            Deactivate {selectedIds.length} selected
          </Button>
        )}

        {showBulkActivate && (
          <Button
            variant="default"
            onClick={() => handleBulkClick("activate")}
            className="cursor-pointer ml-auto bg-green-600 hover:bg-green-700"
          >
            Activate {selectedIds.length} selected
          </Button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-lg border border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-muted">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="font-semibold text-foreground"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>

      {/* BULK CONFIRM DIALOG */}
      <BulkActionConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        count={selectedIds.length}
        action={dialogAction}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
