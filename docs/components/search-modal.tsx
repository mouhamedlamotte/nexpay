"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search, ArrowRight, FileText, Book, Webhook, Settings, Code, Lightbulb } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface SearchItem {
  title: string
  description: string
  href: string
  category: string
  icon: React.ReactNode
}

const searchItems: SearchItem[] = [
  {
    title: "Démarrage Rapide",
    description: "Installation et configuration de NexPay",
    href: "/docs/getting-started",
    category: "Commencer",
    icon: <Book className="h-4 w-4" />,
  },
  {
    title: "Référence API",
    description: "Documentation complète de l'API NexPay",
    href: "/docs/api",
    category: "API",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Webhooks",
    description: "Configuration et gestion des webhooks",
    href: "/docs/webhooks",
    category: "Intégration",
    icon: <Webhook className="h-4 w-4" />,
  },
  {
    title: "Providers",
    description: "Configuration des fournisseurs de paiement",
    href: "/docs/providers",
    category: "Configuration",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Tableau de Bord",
    description: "Guide d'utilisation du dashboard",
    href: "/docs/dashboard",
    category: "Guide",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Guides d'Intégration",
    description: "Exemples et cas d'usage pratiques",
    href: "/docs/guides",
    category: "Guide",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    title: "Initier un Paiement",
    description: "POST /api/v1/payment/initiate",
    href: "/docs/api#initiate-payment",
    category: "API",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Créer une Session",
    description: "POST /api/v1/payment/session/initiate",
    href: "/docs/api#create-session",
    category: "API",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Configurer les Redirections",
    description: "URLs de succès, échec et annulation",
    href: "/docs/dashboard#redirects",
    category: "Configuration",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: "Vérification des Webhooks",
    description: "Sécuriser vos webhooks avec HMAC",
    href: "/docs/webhooks#verification",
    category: "Sécurité",
    icon: <Webhook className="h-4 w-4" />,
  },
]

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const filteredItems = query
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : searchItems

  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, SearchItem[]>,
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault()
        router.push(filteredItems[selectedIndex].href)
        onOpenChange(false)
        setQuery("")
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, selectedIndex, filteredItems, router, onOpenChange])

  const handleItemClick = (href: string) => {
    router.push(href)
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans la documentation..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4">
          {query === "" && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 px-2">PAGES RECOMMANDÉES</p>
            </div>
          )}

          {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
            <div key={category} className={categoryIndex > 0 ? "mt-6" : ""}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">{category.toUpperCase()}</p>
              <div className="space-y-1">
                {items.map((item, itemIndex) => {
                  const globalIndex = filteredItems.indexOf(item)
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleItemClick(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected ? "bg-muted text-accent-foreground" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">Aucun résultat trouvé pour "{query}"</p>
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs">
                ↑↓
              </kbd>
              Naviguer
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs">
                ↵
              </kbd>
              Sélectionner
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-xs">
              ESC
            </kbd>
            Fermer
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
