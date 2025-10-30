"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/admin", icon: BarChart3 },
  { name: "Methodes de paiement", href: "/admin/providers", icon: Package },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();

  // Vérifier la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-collapse sur petit écran
  useEffect(() => {
    if (!isLargeScreen) {
      setCollapsed(true);
    }
  }, [isLargeScreen]);

  const toggleCollapsed = () => {
    if (isLargeScreen) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header - Même hauteur que HubHeader */}
        <div
          className={`flex items-center border-b border-sidebar-border transition-all duration-300 h-14 min-h-[3.5rem] ${
            collapsed ? "justify-center px-4" : "justify-between px-6"
          }`}
        >
          {/* Logo avec animation de fade */}
          <div
            className={`transition-all duration-300 overflow-hidden text-primary text-2xl font-bold ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            NEXPAY
          </div>

          {/* Toggle button - seulement sur grands écrans */}
          {isLargeScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 flex-shrink-0"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 space-y-1 transition-all duration-300 ${
            collapsed ? "p-2" : "p-4"
          }`}
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <div key={item.name} className="relative group">
                <Button
                  variant="ghost"
                  asChild
                  className={`w-full transition-all duration-200 ${
                    collapsed
                      ? "justify-center h-12 px-0"
                      : "justify-start px-3 py-2.5 h-11"
                  } ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon
                      className={`flex-shrink-0 transition-all duration-200 ${
                        collapsed ? "h-6 w-6" : "h-5 w-5"
                      }`}
                    />

                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </Button>

                {/* Tooltip pour mode collapsed */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

         {/* Paramètres */}
        <div
          className={`border-t border-sidebar-border transition-[padding] duration-300 ease-in-out ${
            collapsed ? "p-2" : "p-3"
          }`}
        >
          <Button
            asChild
            variant="ghost"
            className={cn("w-full transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed
                ? "justify-center h-12 px-0"
                : "justify-start px-3 py-2.5 h-11",
              pathname.includes("/admin/settings") && "bg-sidebar-primary/30 text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
             )}
          >
            <Link href={`/admin/settings`} className="flex items-center">
              <Settings
                className={`flex-shrink-0 transition-all duration-200 ${
                  collapsed ? "h-6 w-6" : "h-5 w-5"
                }`}
              />
              {!collapsed && <span className="ml-3">Paramètres</span>}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}