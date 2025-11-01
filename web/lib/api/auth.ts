import { apiClient } from "../api-client";
import { ApiResponse } from "../types";
import { User } from "./users.query";

export interface AuthCredentials {
  email: string;
  password: string;
}


export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: {
    message: string;
    statusCode: number;
  };
}

export const AuthApi = {
  login: async (credentials: AuthCredentials) => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get<ApiResponse<User>>(
      "/users/me"
    );
    console.log("data getProfile", data);
    
    return data;
  },
};
