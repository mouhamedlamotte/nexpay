"use client";

import { useEffect } from "react";
import { useAuthStore } from "./stores/auth/auth-store";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/page-header";
import { useProjectStore } from "@/stores/project.store";
import { useAppStore } from "@/stores/app.store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentProjectId = useProjectStore(
    (state) => state.currentProject?.id
  );
  const { setLoadingPhase, setLoading } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && currentProjectId) {
      setTimeout(() => {
        setLoadingPhase(null);
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated, currentProjectId]);

  if (!isAuthenticated || !currentProjectId) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
