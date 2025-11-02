"use client";

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { ProjectSwitcher } from "./project-switcher";
import { useAuthStore } from "@/app/admin/(dashboard)/stores/auth/auth-store";
import { useAppStore } from "@/stores/app.store";
import { deleteCookie } from "cookies-next";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const {setLoadingPhase, setLoading} = useAppStore()
  const pathname = usePathname();
  
  const logout = useAuthStore(s=>s.logout);
  const handleLogout = () => {
    setLoadingPhase('AUTHENTIFICATION');
    setLoading(true);
    deleteCookie('access_token');
    setTimeout(() => {
      logout();
      window.location.href = '/auth/login?next=' + encodeURIComponent(pathname);
    }, 1000);
  }
  return (
    <header className="flex items-center justify-between h-14 px-6 bg-card border-b border-border z-40">
      <ProjectSwitcher />

      <div className="flex items-center gap-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="hover:text-destructive/60 hover:!border-destructive/60 !border !border-destructive text-destructive"
        >
          <LogIn className="h-6 w-6" />
          Deconnexion
        </Button>
      </div>
    </header>
  );
}
