"use client"

import { use } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { useCheckoutStore } from "@/features/checkout/stores/checkout.store"
import { CheckoutForm } from "@/features/checkout/components/checkout-form"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

interface PageProps {
  params: Promise<{ id: string }>
}

function CheckoutPageContent({ sessionId }: { sessionId: string }) {
  const { setSessionId } = useCheckoutStore()

  useEffect(() => {
    setSessionId(sessionId)
  }, [sessionId, setSessionId])

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-xl lg:max-w-7xl">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Paiement sécurisé</h1>
          <p className="text-muted-foreground">Complétez votre transaction en toute sécurité</p>
        </div>

        <CheckoutForm sessionId={sessionId} />
      </div>
    </main>
  )
}

export default function CheckoutPage({ params }: PageProps) {
  const resolvedParams = use(params)

  return (
    <QueryClientProvider client={queryClient}>
      <CheckoutPageContent sessionId={resolvedParams.id} />
    </QueryClientProvider>
  )
}
