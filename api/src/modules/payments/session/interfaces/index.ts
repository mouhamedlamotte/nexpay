import { SessionStatus } from 'src/lib';
import { PaymentProviderInfo } from 'src/modules/providers/interface';

export interface SessionPaymentResponse {
  sessionId: string;
  checkoutUrl: string;
  status: SessionStatus;
  expiresAt: Date;
}

export interface SessionWithDetails {
  id: string;
  amount: number;
  currency: string;
  status: SessionStatus;
  expiresAt: Date;
  paymentData: string | null;
  checkoutUrl: string;
  providers: PaymentProviderInfo[];
  payer: any;
  project: any;
}

export interface SessionStatusResponse {
  sessionId: string;
  status: SessionStatus;
  redirectUrl: string | null;
}
