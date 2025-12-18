import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Building2, Calendar, ShoppingCart } from "lucide-react"
import type { CheckoutSession } from "../schemas/checkout.schema"

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

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: session.currency,
    }).format(value)
  }

  return (
    <Card className="bg-card border-border h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">Details de la transaction</CardTitle>
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

        {session.items && session.items.length > 0 && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-secondary" />
                <h3 className="text-sm font-semibold text-card-foreground">Articles</h3>
              </div>

              <div className="space-y-3">
                {session.items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-card-foreground whitespace-nowrap">
                        {formatPrice(item.total)}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Prix unitaire</span>
                        <span>{formatPrice(item.unitPrice)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Quantité</span>
                        <span>×{item.quantity}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Sous-total</span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>

                      {item.taxRate !== null && (
                        <div className="flex items-center justify-between">
                          <span>Taux de taxe</span>
                          <span>{item.taxRate}%</span>
                        </div>
                      )}

                      {item.taxAmount !== null && item.taxAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Montant de taxe</span>
                          <span>{formatPrice(item.taxAmount)}</span>
                        </div>
                      )}

                      {item.discount !== null && item.discount > 0 && (
                        <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                          <span>Réduction</span>
                          <span>-{formatPrice(item.discount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
