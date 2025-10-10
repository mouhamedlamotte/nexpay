import { apiClient } from "@/lib/api-client"
import type { ApiResponse, Project, CreateProjectDto, UpdateProjectDto, PaginationParams } from "@/lib/types"

export const projectsApi = {
  getAll: async (params?: PaginationParams) => {
    const { data } = await apiClient.get<ApiResponse<Project[]>>("/projects", { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`)
    return data
  },

  getByName: async (name: string) => {
    const { data } = await apiClient.get<ApiResponse<Project>>(`/projects/name/${name}`)
    return data
  },

  create: async (dto: CreateProjectDto) => {
    const { data } = await apiClient.post<ApiResponse<Project>>("/projects", dto)
    return data
  },

  update: async (id: string, dto: UpdateProjectDto) => {
    const { data } = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, dto)
    return data
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/projects/${id}`)
    return data
  },
}
