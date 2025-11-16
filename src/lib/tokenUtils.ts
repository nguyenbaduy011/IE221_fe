// lib/tokenUtils.ts
import { AuthLoginResponse } from "@/types/user"; // Import type của bạn


export const tokenUtils = {
  setTokens: (data: AuthLoginResponse) => {
    localStorage.setItem("access_token", data.data.access);
    localStorage.setItem("refresh_token", data.data.refresh);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem("access_token");
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem("refresh_token");
  },

  clearTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
