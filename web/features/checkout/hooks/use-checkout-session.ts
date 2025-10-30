import { apiClient } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"

type ErrorResponse = {
  response: {
    data: {
      statusCode: number
      message: string
    }
  }
}

export function useCheckoutSession(sessionId: string | null) {
  return useQuery<any, ErrorResponse>({
    queryKey: ["checkout-session", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("Session ID is required")
      const response = (await apiClient.get(`/payment/session/${sessionId}`)).data
      return response.data
    },
    enabled: !!sessionId,
  })
}
