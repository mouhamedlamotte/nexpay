import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Loader2, QrCode, Undo } from "lucide-react";
import { PaymentResponse } from "../schemas/checkout.schema";
import Image from "next/image";
import { Dispatch, useState } from "react";
import QRCode from "react-qr-code";

interface QrDisplayProps {
  paymentData: PaymentResponse["data"];
  setPaymentData: Dispatch<PaymentResponse["data"] | null>;
}

export function QrDisplay({ paymentData, setPaymentData }: QrDisplayProps) {
  const hasQrCode = !!paymentData.qr_code;

  const [isChanging, setIsChanging] = useState(false);

  const handleChange = () => {
    setIsChanging(true);
    setTimeout(() => {
      setPaymentData(null);
      setIsChanging(false);
    }, 1000);
  };

  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader className="inline-flex flex-row items-center w-full p-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Image className="rounded-full" src={paymentData.provider?.logoUrl || "/placeholder.jpg"} alt={paymentData.provider?.name} width={30} height={30} />
          {paymentData.provider?.name}
        </CardTitle>
        <Button variant="outline" className="ml-auto !border-border hover:border-primary hover:text-primary" onClick={handleChange}>
          {isChanging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo className="mr-2 h-4 w-4" />}
          Changer de Méthode
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasQrCode && (
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Scannez ce QR code avec votre application de paiement
            </p>
            <div className="rounded-lg bg-white p-4">
              {paymentData.qr_code?.data ? (
                <img
                  src={`data:image/png;base64,${paymentData.qr_code?.data}`}
                  alt="QR Code de paiement"
                  className="h-64 w-64"
                  crossOrigin="anonymous"
                />
              ) : paymentData.qr_code?.url ? (
                <QRCode value={paymentData.qr_code.url} size={256} level="L" />
              ) : null}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Ou utilisez ces liens directs :
          </p>
          <div className="grid gap-2">
            {paymentData.checkout_urls.map((url, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between border-border hover:bg-primary/10 hover:border-primary bg-transparent py-6"
                asChild
              >
                <a
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {url.thumb && (
                      <Image
                        src={url.thumb}
                        alt={url.name}
                        width={32}
                        height={32}
                        className="mr-2 rounded-lg"
                      />
                    )}
                    <span className="text-foreground">{url.name}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-secondary" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Référence de paiement
          </p>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {paymentData.reference}
          </p>
          <p className="text-xs text-muted-foreground">
            Expire le:{" "}
            {new Date(paymentData.expiration).toLocaleString("fr-FR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
