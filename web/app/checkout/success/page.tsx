import Link from "next/link"
import { CheckCircle2, Home, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Paiement réussi !</h1>
          <p className="text-muted-foreground text-balance">
            Votre transaction a été effectuée avec succès. Vous recevrez un email de confirmation sous peu.
          </p>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide ?{" "}
            <Link href="/support" className="text-primary hover:underline">
              Contactez le support
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
