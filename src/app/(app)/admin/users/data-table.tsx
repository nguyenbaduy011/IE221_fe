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

export type FilterState = {
  search: string;
  role: string;
  status: string;
};

export interface DataTableProps {
  columns: ColumnDef<User>[];
  data: User[];
  onBulkDelete: (ids: number[]) => void;
  filter: FilterState;
  setFilter: (f: FilterState) => void;
}

export function DataTable({
  columns,
  data,
  onBulkDelete,
  filter,
  setFilter,
}: DataTableProps) {
  const table = useReactTable<User>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original as User).id);

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
            <SelectItem value="ADMIN" className="cursor-pointer">
              ADMIN
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

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => onBulkDelete(selectedIds)}
            className="cursor-pointer ml-auto"
          >
            Delete {selectedIds.length} selected
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
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
    </div>
  );
}
