"use client";

import { useEffect, useState } from "react";
import { CheckoutSummary } from "./checkout-summary";
import { ProviderSelector } from "./provider-selector";
import { QrDisplay } from "./qr-display";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCheckoutStore } from "../stores/checkout.store";
import { useCheckoutSession } from "../hooks/use-checkout-session";
import { PaymentResponse } from "../schemas/checkout.schema";
import { useInitiatePayment } from "../hooks/use-initiate-payment";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CheckoutFormProps {
  sessionId: string;
}

export function CheckoutForm({ sessionId }: CheckoutFormProps) {
  const { provider } = useCheckoutStore();
  const [paymentData, setPaymentData] = useState<PaymentResponse['data'] | null>(null);

  const { data: session, isLoading, error } = useCheckoutSession(sessionId);

  useEffect(() => {
    if(session && session.paymentData) {
      setPaymentData(JSON.parse(session?.paymentData || "{}"));
    }
  }, [session]);

  const initiatePayment = useInitiatePayment();

  const handlePayment = async () => {
    if (!session || !provider) return;

    try {
      const result = await initiatePayment.mutateAsync({
        sessionId,
        data: {
          provider : provider as 'om' | 'wave',
        },
      });

      setPaymentData(result.data);

      const data = result.data;

      // If no QR code, redirect to first checkout URL
      if (!data?.qr_code && data?.checkout_urls.length > 0) {
        window.open(data?.checkout_urls[0].url, "_blank");
      }
    } catch (err) {
      toast.error('Une erreur est survenue lors de l\'initiation du paiement');
      console.error("Payment initiation failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full bg-muted" />
        <Skeleton className="h-48 w-full bg-muted" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="h-[calc(100vh-300px)] flex items-center justify-center">
          <h2 className="text-2xl font-bold text-center">{error?.response?.data?.message || "Une erreur est survenue"}</h2>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className={cn(paymentData && 'hidden lg:block')}>
      <CheckoutSummary session={session} />
      </div>
      <div className="space-y-5">
        {paymentData ? (
          <QrDisplay paymentData={paymentData} setPaymentData={setPaymentData} />
        ) : (
          <>
            <ProviderSelector providers={session.providers} />

            {initiatePayment.isError && (
              <Alert variant="destructive" className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive-foreground">
                  Erreur lors de l'initiation du paiement. Veuillez réessayer.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePayment}
              disabled={!provider || initiatePayment.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {initiatePayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Payer maintenant
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
