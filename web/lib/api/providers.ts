import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaymentProvider,
  UpdatePaymentProviderDto,
  PaginationParams,
} from "@/lib/types";

export const providersApi = {
  getAll: async (params?: PaginationParams & { isActive?: boolean }) => {
    const { data } = await apiClient.get<ApiResponse<PaymentProvider[]>>(
      "/settings/providers",
      { params }
    );
    return data;
  },

  getByCode: async (code: string) => {
    const { data } = await apiClient.get<ApiResponse<PaymentProvider>>(
      `/settings/providers/code/${code}`
    );
    return data;
  },

  update: async (dto: UpdatePaymentProviderDto) => {
    const { data } = await apiClient.put<ApiResponse<PaymentProvider>>(
      "/settings/providers",
      dto
    );
    return data;
  },

  toggle: async (providerId: string, isActive: boolean) => {
    const { data } = await apiClient.put<ApiResponse<void>>(
      `/settings/providers/${providerId}/toggle`,
      {
        isActive: !isActive,
      }
    );
    return data;
  },
};
