// lib/axiosClient.ts
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

export default axiosClient;
