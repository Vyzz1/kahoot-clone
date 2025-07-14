// src/lib/axiosPrivate.ts
import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // chỉnh URL nếu cần
  withCredentials: true, // để gửi cookie chứa refresh token nếu dùng
});

// Add interceptor to attach token from localStorage/context
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosPrivate;
