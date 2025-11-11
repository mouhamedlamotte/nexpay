"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  sessionId: string;
}

type SessionStatus = 'opened' | 'pending' | 'completed' | 'failed' | 'expired' | 'closed';

interface PaymentStatusResponse {
  sessionId: string;
  status: SessionStatus;
  redirectUrl: string | null;
}

export function CheckoutForm({ sessionId }: CheckoutFormProps) {
  const router = useRouter();
  const { provider } = useCheckoutStore();
  const [paymentData, setPaymentData] = useState<PaymentResponse['data'] | null>(null);
  const [_, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const pollingRef = useRef<boolean>(false);

  const { data: session, isLoading, error } = useCheckoutSession(sessionId);

  useEffect(() => {
    if(session && session.paymentData) {
      setPaymentData(JSON.parse(session?.paymentData || "{}"));
    }
  }, [session]);

  const initiatePayment = useInitiatePayment();

  // Long polling function with backend timeout support
  const pollPaymentStatus = useCallback(async () => {
    if (!sessionId || pollingRef.current) return;

    pollingRef.current = true;
    setIsPolling(true);
    setPollingError(null);
    
    const maxDuration = 5 * 60 * 1000; // 5 minutes total
    const startTime = Date.now();

    const poll = async () => {
      try {
        // Backend waits up to 30 seconds per request
        const response = await fetch(`/api/v1/payment/session/${sessionId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_READ_API_KEY || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }

        const result = await response.json();
        const { status, redirectUrl }: PaymentStatusResponse = result.data;

        // Handle terminal states
        if (status === 'completed') {
          pollingRef.current = false;
          setIsPolling(false);
          toast.success('Paiement réussi !');
          
          // Redirect to success URL
          if (redirectUrl) {
            setTimeout(() => window.location.href = redirectUrl, 1000);
          } else if (session?.project?.metadata?.successUrl) {
            setTimeout(() => window.location.href = session.project.metadata.successUrl, 1000);
          } else {
            router.push('/checkout/success');
          }
          return;
        }

        if (status === 'failed') {
          pollingRef.current = false;
          setIsPolling(false);
          toast.error('Le paiement a échoué');
          
          if (redirectUrl) {
            setTimeout(() => window.location.href = redirectUrl, 2000);
          } else if (session?.project?.metadata?.failureUrl) {
            setTimeout(() => window.location.href = session.project.metadata.failureUrl, 2000);
          }
          return;
        }

        if (status === 'expired') {
          pollingRef.current = false;
          setIsPolling(false);
          toast.error('La session de paiement a expiré');
  
          if (session?.project?.metadata?.failureUrl) {
            setTimeout(() => window.location.href = session.project.metadata.failureUrl, 2000);
          }
          return;
        }

        if (status === 'closed') {
          pollingRef.current = false;
          setIsPolling(false);
          toast.warning('La session de paiement a été fermée');
          
          if (session?.project?.metadata?.failureUrl) {
            setTimeout(() => window.location.href = session.project.metadata.failureUrl, 2000);
          }
          return;
        }

        // Continue polling if status is 'opened' or 'pending'
        if (Date.now() - startTime < maxDuration) {
          // Backend returns immediately if status changed, or after 30s timeout
          // So we can call again immediately
          setTimeout(poll, 500); // Small delay to prevent overwhelming the server
        } else {
          pollingRef.current = false;
          setIsPolling(false);
          setPollingError('Le délai d\'attente du paiement a expiré. Veuillez vérifier l\'état de votre transaction.');
          toast.warning('Délai d\'attente dépassé. Veuillez vérifier votre transaction.');
        }
      } catch (err) {
        console.error('Polling error:', err);
        
        // Retry with exponential backoff on error
        if (Date.now() - startTime < maxDuration) {
          setTimeout(poll, 3000);
        } else {
          pollingRef.current = false;
          setIsPolling(false);
          setPollingError('Impossible de vérifier l\'état du paiement. Veuillez réessayer.');
          toast.error('Erreur lors de la vérification du paiement');
        }
      }
    };

    poll();
  }, [sessionId, session, router]);

  const handlePayment = async () => {
    if (!session || !provider) return;

    try {
      const result = await initiatePayment.mutateAsync({
        sessionId,
        data: {
          provider: provider as 'om' | 'wave',
        },
      });

      setPaymentData(result.data);

      const data = result.data;

      // Start long polling after payment initiation
      pollPaymentStatus();

      // If no QR code, redirect to first checkout URL
      if (!data?.qr_code && data?.checkout_urls.length > 0) {
        window.open(data?.checkout_urls[0].url, "_blank");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Une erreur est survenue lors de l\'initiation du paiement');
      console.error("Payment initiation failed:", err);
    }
  };

  // Start polling if payment data exists on mount and session is not terminal
  useEffect(() => {
    const terminalStates = ['completed', 'failed', 'expired', 'closed'];
    if (
      paymentData && 
      !pollingRef.current && 
      session?.status && 
      !terminalStates.includes(session.status)
    ) {
      pollPaymentStatus();
    }

    // Cleanup on unmount
    return () => {
      pollingRef.current = false;
    };
  }, [paymentData, session?.status, pollPaymentStatus]);

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
      <div className="h-[calc(100vh-300px)] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Session introuvable
              </h2>
              <p className="text-muted-foreground">
                {error?.response?.data?.message || "La session de paiement n'existe pas ou a expiré."}
              </p>
            </div>
          </div>
        </div>
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
          <>
            <QrDisplay paymentData={paymentData} setPaymentData={setPaymentData} />

            {pollingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{pollingError}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            <ProviderSelector providers={session.providers} />
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