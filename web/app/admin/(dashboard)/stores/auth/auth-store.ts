/* eslint-disable */
import { ApiError, AuthApi, AuthCredentials, UserData } from "@/lib/api/auth"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasCheckedAuth: boolean,

  // Actions
  login: (credentials: AuthCredentials) => Promise<any>
  checkAuth: () => Promise<void | any>
  updateUser: (userData: Partial<UserData>) => void
  logout: () => void
  setLoading: (loading?: boolean) => void
  setError: (error: string) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasCheckedAuth: false,

      setLoading: (loading = true) => set({ isLoading: loading }),

      setError: (error: string) => set({ error }),

      clearError: () => set({ error: null }),

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null })
          const data = await AuthApi.login(credentials)
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          })
          return data
        } catch (error: any) {
          const apiError = error.response?.data as ApiError
          const errorMessage = apiError?.message || apiError?.details?.message || "Erreur de connexion"
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })
          const data  = await AuthApi.getProfile()
          console.log({data});
          
          set({
            hasCheckedAuth: true,
            user: data.data,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch (error){
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true,
          })
          console.log(error);
          throw new Error("Failed to check authentication status")
        }
      },

      updateUser: (userData) =>
        set((state) => ({
          user: {
            ...state.user!,
            ...userData,
          } as UserData,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCheckedAuth: state.hasCheckedAuth,
      }),
    },
  ),
)
