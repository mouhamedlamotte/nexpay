import { apiClient } from "@/lib/api-client";
import {
  ApiResponse,
  CreateUserDto,
  PaginationParams,
  UpdateUserDto,
} from "../types";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  hasDefaultPassword: boolean;
  email: string;
  isActive: boolean;
  createdAt: string;
  isSuperUser: boolean;
  updatedAt: string;
}

export const UsersApi = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await apiClient.get<ApiResponse<User[]>>("/users", {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  create: async (dto: CreateUserDto) => {
    const { data } = await apiClient.post<ApiResponse<User>>("/users", dto);
    return data;
  },

  update: async (id: string, dto: UpdateUserDto) => {
    const { data } = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      dto
    );
    return data;
  },

  updateProfile: async (dto: UpdateUserDto) => {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/`, dto);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return data;
  },
  changeMyPassword: async (dto: { currentPassword: string; newPassword: string }) => {
    const { data } = await apiClient.put<ApiResponse<void>>(
      `/users/password/reset`,
      dto
    );
    return data;
  },

  deleteOwnAccount: async () => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/users/me`);
    return data;
  },
};
