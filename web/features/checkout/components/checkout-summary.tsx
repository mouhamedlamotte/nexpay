import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, User, Building2, Calendar } from "lucide-react"
import { CheckoutSession } from "../schemas/checkout.schema"
import { Badge } from "@/components/ui/badge"

interface CheckoutSummaryProps {
  session: CheckoutSession
}

export function CheckoutSummary({ session }: CheckoutSummaryProps) {
  const amount = Number.parseFloat(session.amount)
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: session.currency,
  }).format(amount)

  const expiresAt = new Date(session.expiresAt)
  const formattedExpiry = expiresAt.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "opened":
        return <Badge variant="secondary" className="">En cours</Badge>
    }
  }

  return (
    <Card className="bg-card border-border h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          Details de la transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Montant</span>
          <span className="text-2xl font-bold text-primary">{formattedAmount}</span>
        </div>

        <Separator className="bg-border" />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building2 className="h-4 w-4 text-secondary mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{session.project.name}</p>
              <p className="text-xs text-muted-foreground">{session.project.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-secondary mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{session.payer.name}</p>
              <p className="text-xs text-muted-foreground">{session.payer.email}</p>
              <p className="text-xs text-muted-foreground">{session.payer.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-secondary mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Expire le</p>
              <p className="text-xs text-muted-foreground">{formattedExpiry}</p>
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="text-xs text-muted-foreground inline-flex gap-2">
          <span className="mt-1">Statut: </span> {getStatusBadge(session.status)}
        </div>
      </CardContent>
    </Card>
  )
}
