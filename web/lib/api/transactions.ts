import { apiClient } from "@/lib/api-client"
import type { ApiResponse, Transaction, TransactionFilters } from "@/lib/types"

export const transactionsApi = {
  getAll: async (projectId: string, params?: TransactionFilters) => {
    const { data } = await apiClient.get<ApiResponse<Transaction[]>>(`/projects/${projectId}/transactions`, { params })
    return data
  },

  getById: async (projectId: string, id: string) => {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(`/projects/${projectId}/transactions/${id}`)
    return data
  },
}
