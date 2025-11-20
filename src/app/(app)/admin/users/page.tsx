/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { User, UserRole } from "@/types/user";
import { userApi, CreateUserPayload, UpdateUserPayload } from "@/lib/userApi";
import { Button } from "@/components/ui/button";
import { DataTable, FilterState } from "./data-table";
import { getColumns } from "./columns"; // File này giữ nguyên từ code cũ của bạn
import {
  BulkAddUserDialog,
  CreateUserDialog,
  EditUserDialog,
} from "@/components/AdminUserDialogs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Đã xóa DeleteConfirmDialog vì Backend không cho phép xóa

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

  // Xử lý Tạo mới
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

  // Mở Dialog sửa
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  // Xử lý Cập nhật
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

  // Xử lý Khóa/Mở khóa (Single)
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

  // Xử lý Bulk Add
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

  // Xử lý Bulk Deactivate (Thay thế Delete)
  const handleBulkDeactivate = async (ids: number[]) => {
    if (!confirm(`Are you sure you want to deactivate ${ids.length} users?`))
      return;
    try {
      await userApi.bulkDeactivate(ids);
      toast.success(`Deactivated ${ids.length} users successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to deactivate users");
    }
  };

  // Xử lý Bulk Activate
  const handleBulkActivate = async (ids: number[]) => {
    if (!confirm(`Are you sure you want to activate ${ids.length} users?`))
      return;
    try {
      await userApi.bulkActivate(ids);
      toast.success(`Activated ${ids.length} users successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to activate users");
    }
  };

  const { user: sessionUser } = useAuth();

  // Hàm getColumns vẫn lấy từ file columns cũ (có nút Edit)
  const columns = getColumns(handleToggleStatus, handleEditClick, sessionUser);

  return (
    <div className="container mx-auto px-6 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management (Admin)</h1>
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
          loading={loading}
          // Truyền 2 hàm mới thay vì onBulkDelete
          onBulkDeactivate={handleBulkDeactivate}
          onBulkActivate={handleBulkActivate}
        />
      )}

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
    </div>
  );
}
