/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/axiosClient.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
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

    // Chỉ xử lý lỗi 401 (Unauthorized) và không phải là request retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đẩy request vào hàng đợi
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
        // Chuyển hướng về trang login, ví dụ:
        // window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Gọi API để refresh token
        // để request refresh này không bị interceptor bắt lại)
        const rs = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh/`, // Điểm cuối API refresh của bạn
          {
            refresh: refreshToken,
          }
        );

        const { access } = rs.data; // Giả sử API trả về { access: "new_token" }

        // Lưu access token mới (API refresh thường không trả về refresh token mới)
        localStorage.setItem("access_token", access);

        // Cập nhật header cho request gốc và xử lý hàng đợi
        axiosClient.defaults.headers.common["Authorization"] =
          "Bearer " + access;
        originalRequest.headers["Authorization"] = "Bearer " + access;
        processQueue(null, access);

        // Thực hiện lại request gốc đã thất bại
        return axiosClient(originalRequest);
      } catch (_error) {
        // Nếu refresh token cũng hết hạn
        processQueue(_error as AxiosError, null);
        tokenUtils.clearTokens();
        // Chuyển hướng về trang login
        // window.location.href = "/login";
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
