/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosClient from "./axiosClient";
import { User, UserRole } from "@/types/user";

export interface ApiResponse<T> {
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
  is_staff?: boolean;
}

export interface UserQueryParams {
  search?: string;
  role?: string;
  status?: string;
}

export const userApi = {
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
    return axiosClient.patch<ApiResponse<User>>(
      `/api/admin/users/${id}/`,
      data
    );
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

  bulkAdd(data: { emails: string[]; role?: UserRole }) {
    return axiosClient.post<ApiResponse<User[]>>(
      "/api/admin/users/bulk_add/",
      data
    );
  },

  bulkActivate(ids: number[]) {
    return axiosClient.post<ApiResponse<null>>(
      "/api/admin/users/bulk_activate/",
      { ids }
    );
  },

  bulkDeactivate(ids: number[]) {
    return axiosClient.post<ApiResponse<null>>(
      "/api/admin/users/bulk_deactivate/",
      { ids }
    );
  },
};
