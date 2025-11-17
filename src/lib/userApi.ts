/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/userApi.ts
import axiosClient from "./axiosClient";
import { User, UserRole } from "@/types/user";

// Định nghĩa kiểu dữ liệu trả về từ API (API Response Wrapper)
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  errors?: any;
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  role: UserRole;
}

export const userApi = {
  // Lấy danh sách user
  getAll() {
    return axiosClient.get<ApiResponse<User[]>>("/api/admin/users/");
  },

  // Lấy chi tiết user
  getById(id: number) {
    return axiosClient.get<ApiResponse<User>>(`/api/admin/users/${id}/`);
  },

  // Tạo user mới
  create(data: CreateUserPayload) {
    return axiosClient.post<ApiResponse<User>>("/api/admin/users/", data);
  },

  // Xóa user
  delete(id: number) {
    return axiosClient.delete<ApiResponse<null>>(`/api/admin/users/${id}/`);
  },

  // Khóa tài khoản
  deactivate(id: number) {
    return axiosClient.post<ApiResponse<null>>(
      `/api/admin/users/${id}/deactivate/`
    );
  },

  // Mở khóa tài khoản
  activate(id: number) {
    return axiosClient.post<ApiResponse<null>>(
      `/api/admin/users/${id}/activate/`
    );
  },
};
