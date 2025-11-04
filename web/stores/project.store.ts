import { apiClient } from "@/lib/api-client";
import { Project } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  hasCheckedProject: boolean;

  // Actions
  setCurrentProject: (org: Project) => void;
  clearCurrentProject: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAndSetProject: () => Promise<Project | null>;
  validateProject: () => Promise<Project | null>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      isLoading: false,
      error: null,
      hasCheckedProject: false,

      setCurrentProject: (org: Project) => {
        set({
          currentProject: org,
          error: null,
          hasCheckedProject: true,
        });
      },

      clearCurrentProject: () => {
        set({
          currentProject: null,
          hasCheckedProject: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      checkAndSetProject: async () => {
        try {
          set({ isLoading: true, error: null });

          const data = (
            await apiClient.get<{
              data: Project;
            }>("/projects/default")
          ).data;

          set({
            currentProject: data.data,
            isLoading: false,
            hasCheckedProject: true,
            error: null,
          });

          return data.data !== undefined ? data.data : null;
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de l'organisation:",
            error
          );
          set({
            currentProject: null,
            isLoading: false,
            hasCheckedProject: true,
            error: error instanceof Error ? error.message : "Erreur inconnue",
          });

          return null;
        }
      },
      validateProject: async () => {
        try {
          const { currentProject: currentProject } = get();
          
          if (currentProject) {
            const { data } = await apiClient.get<{ data: Project }>(
              `/projects/${currentProject.id}`
            );

            set({
              currentProject: data.data,
              isLoading: false,
              hasCheckedProject: true,
              error: null,
            });

            return data.data !== undefined ? data.data : null;
          } else {
            const { checkAndSetProject } = get();
            const project = await checkAndSetProject();
            return project !== undefined ? project : null;
          }
        } catch (error) {
          const { checkAndSetProject } = get();
          const org = await checkAndSetProject();
          return org !== undefined ? org : null;
        }
      },
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        currentProject: state.currentProject,
        hasCheckedProject: state.hasCheckedProject,
      }),
    }
  )
);
