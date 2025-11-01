  "use client";

  import { useEffect } from "react";
  import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/admin/(dashboard)/stores/auth/auth-store";
import { useAppStore } from "@/stores/app.store";

  export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, isLoading, checkAuth, hasCheckedAuth } = useAuthStore();
    const {setLoadingPhase} = useAppStore()
    const router = useRouter();

    useEffect(() => {

      const checkAuthHere = async () => {
        setLoadingPhase('AUTHENTIFICATION')
        const isAuthenticated = await checkAuth();
        console.log('isAuthenticated', isAuthenticated);

        if (!isAuthenticated) {
          const fullUrl = window.location.href;
          router.replace(`/auth/login?next=${encodeURIComponent(fullUrl)}`);
        }
        setLoadingPhase('PROJECT')
      }
      if(!hasCheckedAuth){
        checkAuthHere()
      }
    }, [hasCheckedAuth]);

    useEffect(() => {
      if (!isLoading  && hasCheckedAuth &&  !isAuthenticated) {
        setLoadingPhase('AUTHENTIFICATION')
        const fullUrl = window.location.href;
        router.replace(`/auth/login?next=${encodeURIComponent(fullUrl)}`);
      }
      setLoadingPhase('PROJECT')
    }, [isAuthenticated, isLoading, hasCheckedAuth]);

    if (!isAuthenticated) {
      return null;
    }

    return <>{children}</>;
  };
