import { useMutation } from "@tanstack/react-query";
import {
  PaymentResponseSchema,
  PaymentInitiateSchema,
  type PaymentInitiate,
  type PaymentResponse,
} from "../schemas/checkout.schema";
import { apiClient } from "@/lib/api-client";

export function useInitiatePayment() {
  return useMutation<PaymentResponse, unknown, { sessionId: string; data: PaymentInitiate }>({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: PaymentInitiate }) => {
      // Validate input with Zod
      const validatedInput = PaymentInitiateSchema.parse(data);

      const response = await apiClient.post<PaymentResponse>(
        `/payment/session/${sessionId}/checkout`,
        validatedInput
      );

      return response.data;
    },
  });
}
