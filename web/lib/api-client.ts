import axios from "axios";
import { getCookie } from "cookies-next";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api/v1",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_READ_API_KEY || 'read',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    const token = getCookie("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
