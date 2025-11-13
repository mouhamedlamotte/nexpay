import { Injectable } from '@nestjs/common';
import { Currency, TransactionStatus } from 'src/lib';
import { TransactionsService } from 'src/modules/projects/transactions/transactions.service';

export interface TransactionFactoryInput {
  amount: number;
  sessionId?: string;
  currency: Currency;
  userId?: string;
  email?: string;
  phone: string;
  name?: string;
  providerId: string;
  providerTransactionId: string;
  client_reference?: string;
  reference: string;
  projectId: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

@Injectable()
export class TransactionFactory {
  constructor(private readonly transactions: TransactionsService) {}

  async createTransaction(data: {
    amount: number;
    sessionId?: string;
    currency: Currency;
    userId?: string;
    email?: string;
    phone: string;
    name?: string;
    providerId: string;
    providerTransactionId: string;
    client_reference?: string;
    reference: string;
    projectId: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
  }) {
    return this.transactions.create({
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      status: TransactionStatus.PENDING,
    });
  }
}
