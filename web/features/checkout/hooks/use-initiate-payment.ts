import { useMutation } from "@tanstack/react-query";
import {
  PaymentResponseSchema,
  PaymentInitiateSchema,
  type PaymentInitiate,
  type PaymentResponse,
} from "../schemas/checkout.schema";
import { apiClient } from "@/lib/api-client";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (data: PaymentInitiate) => {
      // Validate input with Zod
      const validatedInput = PaymentInitiateSchema.parse(data);

      const response = await apiClient.post<PaymentResponse>(
        "/payment/initiate",
        validatedInput
      );

      return response.data;
    },
  });
}
