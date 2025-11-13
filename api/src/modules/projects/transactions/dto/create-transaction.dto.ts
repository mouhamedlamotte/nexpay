import { Currency, TransactionStatus } from '@prisma/client';

export interface CreateTransactionDto {
  amount: number;
  sessionId?: string;
  projectId: string;
  currency: Currency;
  status: TransactionStatus;
  client_reference?: string;
  reference: string;
  providerTransactionId: string;
  userId?: string;
  name?: string;
  email?: string;
  phone: string;
  metadata?: string;
  providerId: string;
  expiresAt?: Date;
}

export interface PayerData {
  userId: string;
  name: string;
  email: string;
  phone: string;
}
