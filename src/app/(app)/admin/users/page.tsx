/* eslint-disable react-hooks/exhaustive-deps */
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
import { Loader2, Users, UserPlus, Upload } from "lucide-react";

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

  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [updating, setUpdating] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    // Note: We keep setLoading(true) here if you want the full page loader
    // every time filters change, or remove it if you want the table to handle its own loading.
    // Based on the reference code, we'll keep the initial load logic mostly.
    if (users.length === 0) setLoading(true);

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
  }, [filter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

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

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditOpen(true);
  };

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

  const handleBulkDeactivate = async (ids: number[]) => {
    try {
      await userApi.bulkDeactivate(ids);
      toast.success(`Deactivated ${ids.length} users successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to deactivate users");
    }
  };

  const handleBulkActivate = async (ids: number[]) => {
    try {
      await userApi.bulkActivate(ids);
      toast.success(`Activated ${ids.length} users successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to activate users");
    }
  };

  const { user: sessionUser } = useAuth();
  const columns = getColumns(handleToggleStatus, handleEditClick, sessionUser);

  // Unified Loading State
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading user directory...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage system users, roles, and access permissions.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => setBulkAddOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button className="shadow-sm" onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-foreground">
            User Directory ({users.length})
          </h2>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={users}
            filter={filter}
            setFilter={setFilter}
            loading={loading}
            onBulkDeactivate={handleBulkDeactivate}
            onBulkActivate={handleBulkActivate}
          />
        </div>
      </div>

      {/* DIALOGS */}
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
