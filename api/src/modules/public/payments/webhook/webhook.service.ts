import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { SessionStatus, TransactionStatus, Webhook } from 'src/lib';
import { firstValueFrom } from 'rxjs';
import { HashService, PrismaService } from 'src/lib';
import { TransactionsService } from 'src/modules/transactions/transactions.service';

enum EventType {
  SUCCEEDED = 'payment.succeeded',
  FAILED = 'payment.failed',
}

interface WebhookEvent {
  type: EventType;
  data: WebhookData;
}

interface WebhookData {
  status: TransactionStatus;
  client_reference: string | null;
  resolvedAt: Date | null;
  amount: number;
  payer: {
    userId: string | null;
    userPhone: string | null;
    userEmail: string | null;
    UserName: string | null;
  };
  provider: {
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  metadata: Record<string, any> | null;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly transactions: TransactionsService,
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly hash: HashService,
  ) {}

  async handleWebhookUpdate(data: {
    reference: string;
    status: TransactionStatus;
  }) {
    try {
      this.logger.log('=== WEBHOOK UPDATE START ===');
      this.logger.debug(`Received data: ${JSON.stringify(data, null, 2)}`);

      const transaction = await this.transactions.findByReference(
        data.reference,
      );

      if (!transaction) {
        this.logger.error('Transaction not found');
        return;
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        this.logger.log(
          `Transaction already updated: id=${transaction.id}, status=${transaction.status}`,
        );
        return;
      }

      const updatedTransaction = await this.transactions.updateStatus(
        data.reference,
        data.status,
      );

      if (updatedTransaction.sessionId) {
        await this.prisma.session.update({
          where: {
            id: updatedTransaction.sessionId,
          },
          data: {
            status: SessionStatus.closed,
          },
        });
      }

      this.logger.log(
        `Transaction updated: id=${transaction.id}, status=${transaction.status}`,
      );

      const webhooks = await this.prisma.webhook.findMany({
        where: {
          projectId: transaction.projectId,
        },
      });

      if (webhooks?.length) {
        const webhookEvent = this.buildWebhookEvent(updatedTransaction);
        await this.sendWebhooks(webhooks, webhookEvent);
      }

      this.logger.log('=== WEBHOOK UPDATE END ===');
    } catch (error) {
      this.logger.error(
        '❌ Error processing webhook update',
        error.stack || error,
      );
      throw error;
    }
  }

  private buildWebhookEvent(transaction: any): WebhookEvent {
    let metadata = transaction.metadata;
    try {
      metadata = JSON.parse(transaction.metadata);
    } catch (error) {
      this.logger.error('Error parsing metadata', error);
    }

    console.log('Transaction in webhook event:', transaction);

    const type =
      transaction.status.toLowerCase() === 'succeeded'
        ? EventType.SUCCEEDED
        : EventType.FAILED;
    this.logger.log(`Building webhook event of type: ${type}`);

    return {
      type,
      data: {
        amount: transaction.amount,
        client_reference: transaction.clientReference,
        status: transaction.status,
        resolvedAt: transaction.resolvedAt,
        payer: {
          userId: transaction.payer?.userId,
          userPhone: transaction.payer?.phone,
          userEmail: transaction.payer?.email,
          UserName: transaction.payer?.name,
        },
        provider: { name: transaction.provider.name },
        project: {
          id: transaction.projectId,
          name: transaction.project.name,
        },
        metadata,
      },
    };
  }

  private async sendWebhooks(webhooks: Webhook[], event: WebhookEvent) {
    await Promise.all(
      webhooks.map(async (webhook) => {
        const headers = { 'Content-Type': 'application/json' };
        try {
          if (webhook.header && webhook.secret) {
            const decriptedSecret = await this.hash.decryptSensitiveData(
              webhook.secret,
            );
            headers[webhook.header] = decriptedSecret;
          }
          await firstValueFrom(this.http.post(webhook.url, event, { headers }));
        } catch (err) {
          this.logger.error(`Failed sending webhook to ${webhook.url}`, err);
        }
      }),
    );
  }
}
