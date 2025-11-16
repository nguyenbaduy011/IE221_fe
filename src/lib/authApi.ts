// lib/authApi.ts
import { AuthResponse } from "@/types/user";
import axiosClient from "./axiosClient";

export const authApi = {
  login(email: string, password: string, rememberMe: boolean) {
    return axiosClient.post<AuthResponse>("/auth/login/", {
      email,
      password,
      remember_me: rememberMe,
    });
  },

  register(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return axiosClient.post<AuthResponse>("/auth/register/", {
      full_name: data.fullName,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
    });
  },
};
