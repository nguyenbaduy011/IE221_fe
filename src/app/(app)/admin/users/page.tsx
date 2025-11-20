/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { User, UserRole } from "@/types/user";
import { userApi, CreateUserPayload, UpdateUserPayload } from "@/lib/userApi";
import { Button } from "@/components/ui/button";
import { DataTable, FilterState } from "./data-table";
import { getColumns } from "./columns";
import {
  BulkAddUserDialog,
  CreateUserDialog,
  EditUserDialog,
} from "@/components/AdminUserDialogs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function AdminUserPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [bulkAddOpen, setBulkAddOpen] = React.useState(false);
  const [bulkAdding, setBulkAdding] = React.useState(false);

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

  // State cho Dialog xác nhận xoá
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteIds, setDeleteIds] = React.useState<number[]>([]);

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

  const handleBulkDelete = (ids: number[]) => {
    setDeleteIds(ids);
    setDeleteOpen(true);
  };

  const handleBulkAdd = async (emails: string[]) => {
    setBulkAdding(true);
    try {
      await userApi.bulkAdd({ emails, role: UserRole.TRAINEE });
      toast.success(`${emails.length} users added`);
      fetchUsers();
      setBulkAddOpen(false);
    } catch (err) {
      toast.error("Failed to add users");
    } finally {
      setBulkAdding(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteIds.map((id) => userApi.delete(id)));
      setUsers((prev) => prev.filter((u) => !deleteIds.includes(u.id)));
      toast.success("Users deleted successfully");
    } catch (err) {
      toast.error("Failed to delete users");
    }
  };

  const { user: sessionUser } = useAuth();

  const columns = getColumns(handleToggleStatus, handleEditClick, sessionUser);

  return (
    <div className="container mx-auto px-6 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button
            className="cursor-pointer"
            onClick={() => setCreateOpen(true)}
          >
            + Add User
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => setBulkAddOpen(true)}
          >
            + Bulk Add Users
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          filter={filter}
          setFilter={setFilter}
          onBulkDelete={handleBulkDelete}
          loading={loading}
        />
      )}

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

      <BulkAddUserDialog
        open={bulkAddOpen}
        onOpenChange={setBulkAddOpen}
        onSubmit={handleBulkAdd}
        loading={bulkAdding}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        count={deleteIds.length}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
