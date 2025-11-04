import { apiClient } from "@/lib/api-client"
import type {
  ApiResponse,
  PaymentProvider,
  PaginationParams,
  ConfigureWaveWebhookDto,
  ConfigureOmWebhookDto,
  WebhookConfig,
  TestPaymentDto,
  TestPaymentResponse,
} from "@/lib/types"

export const providersApi = {
  getAll: async (params?: PaginationParams & { isActive?: boolean }) => {
    const { data } = await apiClient.get<ApiResponse<PaymentProvider[]>>("/providers", { params })
    return data
  },

  getByCode: async (code: string) => {
    const { data } = await apiClient.get<ApiResponse<PaymentProvider>>(`/providers/${code}`)
    return data
  },

  updateSecrets: async (code: string, secrets: Record<string, any>) => {
    const { data } = await apiClient.put<ApiResponse<PaymentProvider>>(`/providers/${code}/secrets`, { secrets })
    return data
  },

  toggle: async (code: string, isActive: boolean) => {
    const { data } = await apiClient.put<ApiResponse<void>>(`/providers/${code}/toggle`, { isActive: !isActive })
    return data
  },

  // Webhook configuration
  configureWaveWebhook: async (dto: ConfigureWaveWebhookDto) => {
    const { data } = await apiClient.post<ApiResponse<WebhookConfig>>("/providers/settings/webhook/wave", dto)
    return data
  },

  getWaveWebhookConfig: async () => {
    const { data } = await apiClient.get<ApiResponse<WebhookConfig>>("/providers/settings/webhook/wave")
    return data
  },

  configureOmWebhook: async (dto: ConfigureOmWebhookDto) => {
    const { data } = await apiClient.post<ApiResponse<WebhookConfig>>("/providers/settings/webhook/om", dto)
    return data
  },

  getOmWebhookConfig: async () => {
    const { data } = await apiClient.get<ApiResponse<WebhookConfig>>("/providers/settings/webhook/om")
    return data
  },

  testPayment: async (code: string, dto: TestPaymentDto) => {
    const { data } = await apiClient.put<ApiResponse<TestPaymentResponse>>(`/providers/${code}/test`, dto)
    return data
  },
}
