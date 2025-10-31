"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchModal } from "@/components/search-modal"
import { useEffect, useState } from "react"

export function DocsHeader() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">NEXPAY</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/docs" className="text-sm text-foreground font-medium">
                Documentation
              </Link>
              <Link href="/docs/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                API
              </Link>
              <Link
                href="/docs/guides"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Guides
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
      
              onClick={() => setSearchOpen(true)}
              className="relative hidden md:flex items-center gap-2 w-64 h-9 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground cursor-pointer hover:bg-card transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Rechercher...</span>
              <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium">
                ⌘K
              </kbd>
            </button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Accueil</Link>
            </Button>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
