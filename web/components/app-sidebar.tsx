"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FolderKanban, CreditCard, Receipt, ChevronLeft, ChevronRight, Webhook, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

export function AppSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, selectedProjectId } = useAppStore()

  const mainNavigation: NavGroup[] = [
    {
      items: [
        {
          title: "Projects",
          href: "/projects",
          icon: FolderKanban,
        },
        {
          title: "Providers",
          href: "/providers",
          icon: CreditCard,
        },
      ],
    },
  ]

  const projectNavigation: NavGroup[] = selectedProjectId
    ? [
        {
          title: "Project",
          items: [
            {
              title: "Transactions",
              href: `/${selectedProjectId}/transactions`,
              icon: Receipt,
            },
          ],
        },
        {
          title: "Settings",
          items: [
            {
              title: "Redirects",
              href: `/${selectedProjectId}/settings/redirects`,
              icon: LinkIcon,
            },
            {
              title: "Webhooks",
              href: `/${selectedProjectId}/settings/webhooks`,
              icon: Webhook,
            },
          ],
        },
      ]
    : []

  const isActive = (href: string) => {
    if (href === "/projects" || href === "/providers") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">NP</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">NEXPAY</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-6">
          {/* Main Navigation */}
          {mainNavigation.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-1">
              {group.title && !sidebarCollapsed && (
                <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h4>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        sidebarCollapsed && "justify-center",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                      {!sidebarCollapsed && item.badge && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Project Navigation */}
          {projectNavigation.length > 0 && (
            <>
              {!sidebarCollapsed && <Separator className="my-2" />}
              {projectNavigation.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-1">
                  {group.title && !sidebarCollapsed && (
                    <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </h4>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                            sidebarCollapsed && "justify-center",
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!sidebarCollapsed && <span>{item.title}</span>}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>

      {/* Footer - Settings at bottom */}
      {!sidebarCollapsed && selectedProjectId && (
        <div className="border-t border-sidebar-border p-3">
          <div className="text-xs text-muted-foreground px-3 mb-2">Project: {selectedProjectId.slice(0, 8)}...</div>
        </div>
      )}
    </div>
  )
}
