/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
  getFilteredRowModel,
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function CourseDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // --- Logic tự động lấy danh sách Category từ data để tạo Filter ---
  const uniqueCategories = React.useMemo(() => {
    const categoriesMap = new Map();
    // Ép kiểu data thành any[] để truy cập thuộc tính categories an toàn trong ngữ cảnh này
    (data as any[]).forEach((course) => {
      if (course.categories && Array.isArray(course.categories)) {
        course.categories.forEach((cat: any) => {
          if (!categoriesMap.has(cat.id)) {
            categoriesMap.set(cat.id, cat.name);
          }
        });
      }
    });
    return Array.from(categoriesMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data]);
  // -----------------------------------------------------------------

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const statusFilterValue = table.getColumn("status")?.getFilterValue();
  const currentStatusValue =
    statusFilterValue !== undefined ? String(statusFilterValue) : "ALL";

  const categoryFilterValue = table.getColumn("categories")?.getFilterValue();
  const currentCategoryValue =
    categoryFilterValue !== undefined ? String(categoryFilterValue) : "ALL";

  const isFiltered = columnFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* SEARCH BY NAME */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter courses..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8 bg-background"
            />
          </div>

          {/* STATUS FILTER */}
          <Select
            value={currentStatusValue}
            onValueChange={(value) => {
              if (value === "ALL") {
                table.getColumn("status")?.setFilterValue(undefined);
              } else {
                table.getColumn("status")?.setFilterValue(Number(value));
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="0">Not Started</SelectItem>
              <SelectItem value="1">In Progress</SelectItem>
              <SelectItem value="2">Finished</SelectItem>
            </SelectContent>
          </Select>

          {uniqueCategories.length > 0 && (
            <Select
              value={currentCategoryValue}
              onValueChange={(value) => {
                if (value === "ALL") {
                  table.getColumn("categories")?.setFilterValue(undefined);
                } else {
                  table.getColumn("categories")?.setFilterValue(value);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-background cursor-pointer">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">
                  All Categories
                </SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={cat.id}
                    value={String(cat.id)}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* RESET BUTTON */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="px-2 lg:px-3 cursor-pointer"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/50 hover:bg-muted/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground/80"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-end space-x-2 py-2">
        <div className="text-xs text-muted-foreground mr-2">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
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
  );
}
