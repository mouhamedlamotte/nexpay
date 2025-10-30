"use client";
import Link from "next/link";
import { XCircle, Home, RotateCcw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

export default function FailedPage() {
  const sessionId = useSearchParams().get("cosId");
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Paiement échoué
          </h1>
          <p className="text-muted-foreground text-balance">
            Votre transaction n'a pas pu être complétée. Veuillez vérifier vos
            informations et réessayer.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-sm text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Raisons possibles
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            <li>• Solde insuffisant</li>
            <li>• Informations de paiement incorrectes</li>
            <li>• Problème de connexion réseau</li>
            <li>• Transaction annulée</li>
          </ul>
        </div>

        {sessionId && (
          <div className="pt-4 space-y-3">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/checkout/${sessionId}`}>
                <RotateCcw className="h-4 w-4" />
                Revenir au paiement
              </Link>
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Problème persistant ?{" "}
            <Link href="/support" className="text-primary hover:underline">
              Contactez le support
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
