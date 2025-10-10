import { apiClient } from "@/lib/api-client"
import type {
  ApiResponse,
  CallbackUrls,
  Webhook,
  CreateWebhookDto,
  UpdateWebhookDto,
  PaginationParams,
} from "@/lib/types"

export const settingsApi = {
  // Redirects/Callbacks
  getRedirects: async (projectId: string) => {
    const { data } = await apiClient.get<ApiResponse<CallbackUrls>>(`/${projectId}/settings/redirects`)
    return data
  },

  createRedirects: async (projectId: string, dto: CallbackUrls) => {
    const { data } = await apiClient.post<ApiResponse<CallbackUrls>>(`/${projectId}/settings/redirects`, dto)
    return data
  },

  updateRedirects: async (projectId: string, dto: CallbackUrls) => {
    const { data } = await apiClient.put<ApiResponse<CallbackUrls>>(`/${projectId}/settings/redirects`, dto)
    return data
  },

  // Webhooks
  getWebhooks: async (projectId: string, params?: PaginationParams) => {
    const { data } = await apiClient.get<ApiResponse<Webhook[]>>(`/${projectId}/settings/webhooks`, { params })
    return data
  },

  getWebhook: async (projectId: string, id: string) => {
    const { data } = await apiClient.get<ApiResponse<Webhook>>(`/${projectId}/settings/webhooks/${id}`)
    return data
  },

  createWebhook: async (projectId: string, dto: CreateWebhookDto) => {
    const { data } = await apiClient.post<ApiResponse<Webhook>>(`/${projectId}/settings/webhooks`, dto)
    return data
  },

  updateWebhook: async (projectId: string, id: string, dto: UpdateWebhookDto) => {
    const { data } = await apiClient.put<ApiResponse<Webhook>>(`/${projectId}/settings/webhooks/${id}`, dto)
    return data
  },
}
