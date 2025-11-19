/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./axiosClient";
import { User, UserRole } from "@/types/user";

// Định nghĩa kiểu dữ liệu trả về từ API
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

export interface UpdateUserPayload {
  email?: string;
  full_name?: string;
  role?: UserRole;
  birthday?: string | null;
  gender?: number | null;
}

// Kiểu dữ liệu cho bộ lọc
export interface UserQueryParams {
  search?: string;
  role?: string;
  status?: string;
}

export const userApi = {
  // SỬA Ở ĐÂY: Thêm params vào hàm getAll
  getAll(params?: UserQueryParams) {
    return axiosClient.get<ApiResponse<User[]>>("/api/admin/users/", {
      params,
    });
  },

  getById(id: number) {
    return axiosClient.get<ApiResponse<User>>(`/api/admin/users/${id}/`);
  },

  create(data: CreateUserPayload) {
    return axiosClient.post<ApiResponse<User>>("/api/admin/users/", data);
  },

  update(id: number, data: UpdateUserPayload) {
    // Dùng PATCH hoặc PUT tùy backend, thường update 1 phần dùng PATCH
    return axiosClient.patch<ApiResponse<User>>(
      `/api/admin/users/${id}/`,
      data
    );
  },

  delete(id: number) {
    return axiosClient.delete<ApiResponse<null>>(`/api/admin/users/${id}/`);
  },

  deactivate(id: number) {
    return axiosClient.post<ApiResponse<null>>(
      `/api/admin/users/${id}/deactivate/`
    );
  },

  activate(id: number) {
    return axiosClient.post<ApiResponse<null>>(
      `/api/admin/users/${id}/activate/`
    );
  },
};
