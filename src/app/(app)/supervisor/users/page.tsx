/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { User } from "@/types/user";
import { userApi } from "@/lib/userApi";
import { SupervisorDataTable, SupervisorFilterState } from "./data-table";
import { getSupervisorColumns } from "./columns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Users, ShieldCheck } from "lucide-react";

export default function SupervisorUserPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [filter, setFilter] = React.useState<SupervisorFilterState>({
    search: "",
    role: "ALL",
    status: "ALL",
  });

  const fetchUsers = React.useCallback(async () => {
    // Keep loading true on initial load or if list is empty for better UX
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
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        toast.error("Permission denied: Cannot modify this user");
      } else {
        toast.error("Failed to update status");
      }
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
  const columns = getSupervisorColumns(handleToggleStatus, sessionUser);

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
          <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>
              Supervisor View - Manage statuses and view user details.
            </span>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            User Directory ({users.length})
          </h2>
        </div>
        <div className="p-6">
          <SupervisorDataTable
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
    </div>
  );
}
