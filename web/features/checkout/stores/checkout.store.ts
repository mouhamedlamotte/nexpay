import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CheckoutState {
  provider: string | null
  sessionId: string | null
  paymentReference: string | null
  setProvider: (provider: string) => void
  setSessionId: (id: string) => void
  setPaymentReference: (ref: string) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      provider: null,
      sessionId: null,
      paymentReference: null,
      setProvider: (provider) => set({ provider }),
      setSessionId: (id) => set({ sessionId: id }),
      setPaymentReference: (ref) => set({ paymentReference: ref }),
      reset: () => set({ provider: null, sessionId: null, paymentReference: null }),
    }),
    {
      name: "checkout-storage",
    },
  ),
)
