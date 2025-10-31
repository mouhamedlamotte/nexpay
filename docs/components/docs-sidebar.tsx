"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

const navigation = [
  {
    title: "Démarrage",
    href: "/docs/getting-started",
  },
  {
    title: "Référence API",
    href: "/docs/api",
    children: [
      { title: "Authentification", href: "/docs/api#authentication" },
      { title: "Initier un Paiement", href: "/docs/api#initiate-payment" },
      { title: "Sessions de Paiement", href: "/docs/api#payment-sessions" },
      { title: "Gestion des Erreurs", href: "/docs/api#errors" },
    ],
  },
  {
    title: "Webhooks",
    href: "/docs/webhooks",
    children: [
      { title: "Webhooks Provider", href: "/docs/webhooks#provider-webhooks" },
      { title: "Webhooks Application", href: "/docs/webhooks#application-webhooks" },
      { title: "Vérification", href: "/docs/webhooks#verification" },
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
    title: "Guide du Tableau de Bord",
    href: "/docs/dashboard",
    children: [
      { title: "Projets", href: "/docs/dashboard#projects" },
      { title: "Providers", href: "/docs/dashboard#providers" },
      { title: "Webhooks", href: "/docs/dashboard#webhooks" },
      { title: "Clés API", href: "/docs/dashboard#api-keys" },
    ],
  },
  {
    title: "Guides d'Intégration",
    href: "/docs/guides",
  },
]

export function DocsSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [activeHash, setActiveHash] = useState<string>("")

  const toggleSection = (href: string) => {
    setExpandedSections((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  // Initialiser et gérer le hash
  useEffect(() => {
    // Initialiser le hash au chargement
    const initialHash = window.location.hash.slice(1)
    if (initialHash) {
      setActiveHash(initialHash)
    }

    // Gérer les changements de hash (navigation via liens)
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1)
      setActiveHash(newHash)
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Scroll spy amélioré
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Récupérer toutes les sections avec id
          const sections = document.querySelectorAll("[id]")
          
          if (sections.length === 0) {
            ticking = false
            return
          }

          // Trouver quelle section est actuellement visible
          let currentSection = ""
          const scrollPosition = window.scrollY + 150 // Offset pour le header

          sections.forEach((section) => {
            const element = section as HTMLElement
            const sectionTop = element.offsetTop
            const sectionHeight = element.offsetHeight

            // Si on est dans cette section
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
              currentSection = element.id
            }
          })

          // Si on a trouvé une section et qu'elle est différente
          if (currentSection && currentSection !== activeHash) {
            setActiveHash(currentSection)
            // Mettre à jour l'URL sans déclencher de navigation
            const newUrl = `${window.location.pathname}#${currentSection}`
            if (window.location.href !== newUrl) {
              history.replaceState(null, "", newUrl)
            }
          }

          ticking = false
        })

        ticking = true
      }
    }

    // Exécuter une fois au montage
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeHash])

  // Auto-expand sections basé sur le pathname
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children && pathname.startsWith(item.href.split("#")[0])) {
        setExpandedSections((prev) => 
          prev.includes(item.href) ? prev : [...prev, item.href]
        )
      }
    })
  }, [pathname])

  return (
    <aside className="w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href.split("#")[0] + "/")
          const isExpanded = expandedSections.includes(item.href)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.href}>
              <div className="flex items-center">
                {hasChildren && (
                  <button
                    title="Expand/Collapse"
                    onClick={() => toggleSection(item.href)}
                    className="p-1 hover:bg-muted rounded mr-1"
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform text-muted-foreground",
                        isExpanded && "rotate-90"
                      )}
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
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.title}
                </Link>
              </div>

              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const childHash = child.href.split("#")[1] || ""
                    const childPath = child.href.split("#")[0]
                    const isChildActive = pathname.startsWith(childPath) && activeHash === childHash

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors relative pl-6",
                          isChildActive && "font-medium text-primary"
                        )}
                        onClick={() => {
                          // Mettre à jour immédiatement au clic
                          if (childHash) {
                            setActiveHash(childHash)
                          }
                        }}
                      >
                        {isChildActive && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        {child.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}