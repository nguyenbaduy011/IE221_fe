import { AuthLoginResponse, AuthRegisterResponse } from "@/types/user";
import axiosClient from "./axiosClient";
import { ChangePasswordFormValues, UpdateProfileFormValues } from "@/validations/profileValidation";

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
    return axiosClient.get(`/auth/activate/${uidb64}/${token}/`);
  },

  resendActivation(email: string) {
    return axiosClient.post("/auth/resend-activation/", { email });
  },

  getMe() {
    return axiosClient.get("/auth/me/");
  },

  updateProfile(data: UpdateProfileFormValues) {
    // Mapping key cho khớp với Django (full_name snake_case)
    return axiosClient.patch("/auth/me/", {
      full_name: data.fullName,
      birthday: data.birthday,
      gender: data.gender
    });
  },

  // Đổi mật khẩu
  changePassword(data: ChangePasswordFormValues) {
    return axiosClient.put("/auth/change-password/", {
      old_password: data.currentPassword,
      new_password: data.newPassword,
      new_password_confirm: data.confirmPassword,
    });
  },
};
