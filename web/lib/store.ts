import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface AppState {
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "nexpay-admin-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
