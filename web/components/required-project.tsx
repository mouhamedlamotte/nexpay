/* eslint-disable */

"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProjectStore } from "@/stores/project.store";
import { useAuthStore } from "@/app/admin/(dashboard)/stores/auth/auth-store";
import { useAppStore } from "@/stores/app.store";


interface RequireProjectProps {
  children: React.ReactNode;
}

const QUICKSETUP_PATH = "/admin/projects";

const IGNORED_PATH_PREFIXES = [QUICKSETUP_PATH] as const;

export const RequireProject = ({ children }: RequireProjectProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, hasCheckedAuth } = useAuthStore();
  const { setLoadingPhase, setLoading } = useAppStore();
  const {
    validateProject,
    hasCheckedProject,
  } = useProjectStore();



const isIgnoredPath = useMemo(() => {
  return IGNORED_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));
}, [pathname]);


  // Logique principale de gestion des project
  const handleProjectLogic = useCallback(async () => {
    try {
      setLoadingPhase("PROJECT");


      // Ignorer certains chemins
      if (isIgnoredPath) {
        setLoading(false);
        setLoadingPhase(null)
        return;
      }
      // Vérifier et récupérer  project
      const currentProject = await validateProject();


      // Si aucun project n'est disponible, rediriger vers quicksetup
      if (!currentProject) {
        typeof window !== "undefined" && window.location.replace(QUICKSETUP_PATH);
        return;
      }

      setLoading(false);
      setLoadingPhase(null)
      return;

    } catch (error) {
      console.error("Erreur lors de la gestion de  project:", error);
      alert("Une erreur s'est produite lors de la gestion de  project. FIn");
      router.push(QUICKSETUP_PATH);
    }
  }, [
    isIgnoredPath,
    setLoadingPhase,
    setLoading,
    validateProject,
    router,
  ]);

  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (!hasCheckedAuth || !isAuthenticated) {
      return;
    }

    // Délai pour éviter les appels trop rapides
    const timeoutId = setTimeout(() => {
      handleProjectLogic();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    hasCheckedAuth,
    isAuthenticated,
    handleProjectLogic,
    pathname,
  ]);


  if (!hasCheckedAuth || !isAuthenticated) {
    return null;
  }

  if (!isIgnoredPath && !hasCheckedProject) {
    return null;
  }

  return <>{children}</>;
};