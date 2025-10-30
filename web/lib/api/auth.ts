import { apiClient } from "../api-client";
import { ApiResponse } from "../types";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  // Ajoutez d'autres propriétés selon vos besoins
}

export interface AuthResponse {
  message: string;
  user: UserData;
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
    const { data } = await apiClient.get<ApiResponse<UserData>>(
      "/users/me"
    );
    console.log("data getProfile", data);
    
    return data;
  },
};
