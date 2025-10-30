import { create } from "zustand"
import { persist } from "zustand/middleware"


interface AppState {
  isAppLoading: boolean
  loadingPhase: null | 'INITIALISATION' | 'AUTHENTIFICATION' | 'PROJECT' | 'FINALISATION'

  // Scalabilité : autres états à persister
  theme?: "light" | "dark"
  language?: string
  sidebarOpen?: boolean

  // Actions
  setLoading: (loading: boolean) => void
  setLoadingPhase: (phase:null | 'INITIALISATION' | 'AUTHENTIFICATION' | 'PROJECT' | 'FINALISATION') => void
  setTheme: (theme: "light" | "dark") => void
  setLanguage: (lang: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAppLoading: true,
      loadingPhase: 'INITIALISATION',
      theme: "light",
      language: "fr",
      sidebarOpen: true,


      setLoading: (loading) => set({ isAppLoading: loading }),
      setLoadingPhase: (phase) => set({ loadingPhase: phase }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)