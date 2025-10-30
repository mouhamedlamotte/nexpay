import { create } from "zustand"
import type { LoginStep } from "@/types/auth"

interface LoginState {
  currentStep: LoginStep
  email: string
  isPasswordVisible: boolean

  // Actions
  setCurrentStep: (step: LoginStep) => void
  setEmail: (email: string) => void
  togglePasswordVisibility: () => void
  reset: () => void
}

export const useLoginStore = create<LoginState>((set) => ({
  currentStep: "initial",
  email: "",
  isPasswordVisible: false,

  setCurrentStep: (step) => set({ currentStep: step }),

  setEmail: (email) => set({ email }),

  togglePasswordVisibility: () => set((state) => ({ isPasswordVisible: !state.isPasswordVisible })),

  reset: () =>
    set({
      currentStep: "initial",
      email: "",
      isPasswordVisible: false,
    }),
}))
