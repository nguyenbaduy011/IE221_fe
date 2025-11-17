/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/axiosClient.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenUtils } from "./tokenUtils";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const access_token = tokenUtils.getAccessToken();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url && originalRequest.url.includes("/auth/logout")) {
        return Promise.reject(error);
      }

      if (originalRequest.url && originalRequest.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenUtils.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        tokenUtils.clearTokens();
        // Chuyển hướng về trang login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Gọi API để refresh token
        const rs = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = rs.data.data || rs.data;

        tokenUtils.setAccessToken(access);

        // Cập nhật header cho request gốc và xử lý hàng đợi
        axiosClient.defaults.headers.common["Authorization"] =
          "Bearer " + access;
        originalRequest.headers["Authorization"] = "Bearer " + access;
        processQueue(null, access);

        // Thực hiện lại request gốc đã thất bại
        return axiosClient(originalRequest);
      } catch (_error) {
        // Nếu refresh token cũng hết hạn hoặc lỗi (như lỗi 500 User Not Found)
        processQueue(_error as AxiosError, null);
        tokenUtils.clearTokens();

        // Chuyển hướng về trang login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
