import axios from "axios";
import { getCookie } from "cookies-next";
import { config } from "./config";

export const apiClient = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": config.READ_API_KEY,
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
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
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);