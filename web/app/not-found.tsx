import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground">Page introuvable</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Page précédente
            </Link>
          </Button>
        </div>

        {/* Decorative element */}
        <div className="pt-8 opacity-50">
          <svg
            className="w-full h-32 text-muted-foreground/20"
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 30C20 10 40 10 60 30C80 50 100 50 120 30C140 10 160 10 180 30C190 40 195 45 200 50"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
