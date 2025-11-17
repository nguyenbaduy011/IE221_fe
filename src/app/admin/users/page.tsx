"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { userApi } from "@/lib/userApi";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState({
    search: "",
    role: "ALL",
    status: "ALL",
  });

  const fetchUsers = async () => {
    const res = await userApi.getAll();
    setUsers(res.data.data || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(filter.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.search.toLowerCase());

      const matchRole = filter.role === "ALL" ? true : u.role === filter.role;

      const matchStatus =
        filter.status === "ALL"
          ? true
          : filter.status === "ACTIVE"
            ? u.is_active
            : !u.is_active;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, filter]);

  const toggleStatus = async (user: User) => {
    const res = user.is_active
      ? await userApi.deactivate(user.id)
      : await userApi.activate(user.id);

    if (res.data.status === "success") fetchUsers();
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (!confirm(`Xóa ${ids.length} user?`)) return;

    await Promise.all(ids.map((id) => userApi.delete(id)));
    fetchUsers();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>

        <Button onClick={() => alert("TODO: Add user modal")}>
          + Thêm nhân viên
        </Button>
      </div>

      <DataTable
        columns={columns(toggleStatus)}
        data={filteredUsers}
        filter={filter}
        setFilter={setFilter}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}
