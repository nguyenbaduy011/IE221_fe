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
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm tên hoặc email..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="max-w-xs"
        />

        <Select
          value={filter.role}
          onValueChange={(v) => setFilter({ ...filter, role: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
            <SelectItem value="TRAINEE">TRAINEE</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.status}
          onValueChange={(v) => setFilter({ ...filter, status: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => onBulkDelete(selectedIds)}
          >
            Xóa {selectedIds.length} mục
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  className="text-center py-6"
                >
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="text-sm text-muted-foreground">
          Trang {table.getState().pagination.pageIndex + 1} /{" "}
          {table.getPageCount()}
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
