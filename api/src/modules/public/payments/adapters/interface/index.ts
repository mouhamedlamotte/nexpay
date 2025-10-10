import { Currency } from 'src/lib';

export interface PaymentAdapter {
  initiate(data: PaymentInitiationData): Promise<PaymentResponse>;
}

export interface PaymentInitiationData {
  amount: number;
  currency: Currency;
  userId?: string;
  email?: string;
  phone?: string;
  name?: string;
  providerId: string;
  projectId: string;
  reference: string;
  client_reference?: string;
  secrets: Record<string, string>;
  metadata?: Record<string, any>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  amount: number;
  currency: string;
  reference: string;
  payer: {
    userId?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  checkout_urls?: {
    name: string;
    url: string;
    logo_url?: string;
  }[];
  qr_code?: {
    url?: string;
    data?: string;
  };
  expiration?: string;
}
