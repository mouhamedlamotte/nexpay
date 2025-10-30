"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
  },
  {
    title: "API Reference",
    href: "/docs/api",
    children: [
      { title: "Authentication", href: "/docs/api#authentication" },
      { title: "Initiate Payment", href: "/docs/api#initiate-payment" },
      { title: "Payment Sessions", href: "/docs/api#payment-sessions" },
      { title: "Error Handling", href: "/docs/api#errors" },
    ],
  },
  {
    title: "Webhooks",
    href: "/docs/webhooks",
    children: [
      { title: "Provider Webhooks", href: "/docs/webhooks#provider-webhooks" },
      { title: "Application Webhooks", href: "/docs/webhooks#application-webhooks" },
      { title: "Verification", href: "/docs/webhooks#verification" },
    ],
  },
  {
    title: "Providers",
    href: "/docs/providers",
    children: [
      { title: "Orange Money", href: "/docs/providers#orange-money" },
      { title: "Wave", href: "/docs/providers#wave" },
    ],
  },
  {
    title: "Dashboard Guide",
    href: "/docs/dashboard",
    children: [
      { title: "Projects", href: "/docs/dashboard#projects" },
      { title: "Providers", href: "/docs/dashboard#providers" },
      { title: "Webhooks", href: "/docs/dashboard#webhooks" },
      { title: "API Keys", href: "/docs/dashboard#api-keys" },
    ],
  },
  {
    title: "Integration Guides",
    href: "/docs/guides",
  },
]

export function DocsSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (href: string) => {
    setExpandedSections((prev) => (prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]))
  }

  return (
    <aside className="w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const isExpanded = expandedSections.includes(item.href) || isActive
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.href}>
              <div className="flex items-center">
                {hasChildren && (
                  <button onClick={() => toggleSection(item.href)} className="p-1 hover:bg-muted rounded mr-1">
                    <ChevronRight
                      className={cn("h-4 w-4 transition-transform text-muted-foreground", isExpanded && "rotate-90")}
                    />
                  </button>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm rounded-lg transition-colors",
                    !hasChildren && "ml-6",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {item.title}
                </Link>
              </div>
              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
