/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { User } from "@/types/user";
import { userApi, CreateUserPayload, UpdateUserPayload } from "@/lib/userApi";
import { Button } from "@/components/ui/button";
import { DataTable, FilterState } from "./data-table";
import { getColumns } from "./columns";
import {
  CreateUserDialog,
  EditUserDialog,
} from "@/components/AdminUserDialogs";
import { toast } from "sonner";

export default function AdminUserPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [filter, setFilter] = React.useState<FilterState>({
    search: "",
    role: "ALL",
    status: "ALL",
  });

  // State cho Dialog Tạo mới
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  // State cho Dialog Chỉnh sửa
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [updating, setUpdating] = React.useState(false);

  // Fetch data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search: filter.search,
        role: filter.role === "ALL" ? "" : filter.role,
        status: filter.status === "ALL" ? "" : filter.status,
      };
      const res = await userApi.getAll(params);
      setUsers(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [filter]);

  // Xử lý Tạo mới (Nhận data từ Dialog)
  const handleCreateUser = async (data: CreateUserPayload) => {
    setCreating(true);
    try {
      await userApi.create(data);
      setCreateOpen(false);
      fetchUsers();
      toast.success("User created successfully");
    } catch (err: any) {
      toast.error("Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  // Xử lý click nút Sửa (Mở dialog)
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  // Xử lý Cập nhật (Nhận data từ Dialog)
  const handleUpdateUser = async (id: number, data: UpdateUserPayload) => {
    setUpdating(true);
    try {
      await userApi.update(id, data);
      setEditOpen(false);
      setEditingUser(null);
      fetchUsers();
      toast.success("User updated successfully");
    } catch (err) {
      toast.error("Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  // Xử lý Khóa/Mở khóa
  const handleToggleStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await userApi.deactivate(user.id);
        toast.success("User deactivated successfully");
      } else {
        await userApi.activate(user.id);
        toast.success("User activated successfully");
      }
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Xử lý Xóa nhiều
  const handleBulkDelete = async (ids: number[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} users?`))
      return;
    try {
      await Promise.all(ids.map((id) => userApi.delete(id)));
      setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
      toast.success("Users deleted successfully");
    } catch (err) {
      toast.error("Failed to delete users");
    }
  };

  const columns = getColumns(handleToggleStatus, handleEditClick);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="cursor-pointer" onClick={() => setCreateOpen(true)}>
          + Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        filter={filter}
        setFilter={setFilter}
        onBulkDelete={handleBulkDelete}
      />

      {/* Dialogs đã được tách ra */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateUser}
        loading={creating}
      />

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editingUser}
        onSubmit={handleUpdateUser}
        loading={updating}
      />
    </div>
  );
}
