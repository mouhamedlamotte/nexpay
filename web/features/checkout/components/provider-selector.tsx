"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { useCheckoutStore } from "../stores/checkout.store"
import { Providers } from "../schemas/checkout.schema"
import Image from "next/image"


export function ProviderSelector({providers}: {providers: Providers[]}) {
  const { provider, setProvider } = useCheckoutStore()

  return (
    <div className="space-y-5">
      {/* <Label className="text-base font-semibold text-foreground">Choisissez votre méthode de paiement</Label> */}
      <RadioGroup value={provider || ""} onValueChange={setProvider}>
        <div className="grid md:grid-cols-2 gap-3">
          {providers.map((p) => {
            return (
              <Card
                key={p.id}
                className={`relative cursor-pointer transition-all hover:border-primary ${
                  provider === p.code ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setProvider(p.code)}
              >
                <div className="flex items-center gap-4 p-2">
                  <RadioGroupItem value={p.code} id={p.code} className="sr-only" />
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden`}>
                    <Image src={p.logoUrl || "/placeholder.jpg"} alt={p.name} width={600} height={600} />
                  </div>
                  <Label htmlFor={p.code} className="flex-1 cursor-pointer font-bold text-foreground text-lg">
                    {p.name}
                  </Label>
                </div>
              </Card>
            )
          })}
        </div>
      </RadioGroup>
    </div>
  )
}
