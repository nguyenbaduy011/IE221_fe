// lib/authApi.ts
import { AuthLoginResponse, AuthRegisterResponse } from "@/types/user";
import axiosClient from "./axiosClient";

export const authApi = {
  login(email: string, password: string, rememberMe: boolean) {
    return axiosClient.post<AuthLoginResponse>("/auth/login/", {
      email,
      password,
      remember_me: rememberMe,
    });
  },

  logout(refreshToken: string) {
    return axiosClient.post("/auth/logout/", {
      refresh: refreshToken,
    });
  },

  register(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return axiosClient.post<AuthLoginResponse>("/auth/register/", {
      full_name: data.fullName,
      email: data.email,
      password: data.password,
      role: "TRAINEE",
    });
  },

  supervisorRegister(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "TRAINEE" | "SUPERVISOR";
  }) {
    return axiosClient.post<AuthRegisterResponse>("/auth/register/", {
      full_name: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
    });
  },

  activate(uidb64: string, token: string) {
    // Gọi đến API GET /auth/activate/<uid>/<token>/ của Django
    return axiosClient.get(`/auth/activate/${uidb64}/${token}/`);
  },
};
