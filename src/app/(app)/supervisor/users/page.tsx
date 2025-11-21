/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { User } from "@/types/user";
import { userApi } from "@/lib/userApi"; // Đảm bảo userApi có hàm bulkDeactivate, bulkActivate
import { SupervisorDataTable, SupervisorFilterState } from "./data-table";
import { getSupervisorColumns } from "./columns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function SupervisorUserPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [filter, setFilter] = React.useState<SupervisorFilterState>({
    search: "",
    role: "ALL",
    status: "ALL",
  });

  // Fetch data
  // Backend (UserViewSet) sẽ tự động loại bỏ ADMIN khi user gọi là SUPERVISOR
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

  // Xử lý Khóa/Mở khóa từng user
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
      // Nếu backend trả về lỗi 403 (ví dụ cố tình deactivate Admin bằng API)
      if (err.response && err.response.status === 403) {
        toast.error("Permission denied: Cannot modify this user");
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  // Xử lý Bulk Deactivate
  const handleBulkDeactivate = async (ids: number[]) => {
    try {
      // Giả sử API nhận payload { ids: number[] }
      await userApi.bulkDeactivate(ids);
      toast.success(`Deactivated ${ids.length} users successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to deactivate users");
    }
  };

  // Xử lý Bulk Activate
  const handleBulkActivate = async (ids: number[]) => {
    try {
      // Giả sử API nhận payload { ids: number[] }
      await userApi.bulkActivate(ids);
      toast.success(`Activated ${ids.length} users successfully`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to activate users");
    }
  };

  const { user: sessionUser } = useAuth();

  const columns = getSupervisorColumns(handleToggleStatus, sessionUser);

  return (
    <div className="container mx-auto px-6 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management (Supervisor)</h1>
        {/* Supervisor không có quyền Add/Bulk Add User -> Đã xóa button */}
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <SupervisorDataTable
          columns={columns}
          data={users}
          filter={filter}
          setFilter={setFilter}
          loading={loading}
          onBulkDeactivate={handleBulkDeactivate}
          onBulkActivate={handleBulkActivate}
        />
      )}
    </div>
  );
}
