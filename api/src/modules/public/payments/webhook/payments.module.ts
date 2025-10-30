import { Module } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PaymentsController } from '../payments.controller';
import { HttpModule } from '@nestjs/axios';
import { WaveService } from '../adapters/wave.service';
import { OMService } from '../adapters/om.service';
import { TransactionsService } from '../../../transactions/transactions.service';
import { TransactionFactory } from '../helpers/transaction.factory';
import { PaymentProviderService } from 'src/modules/settings/providers/payment-provider.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    HttpModule.register({
      maxRedirects: 5,
    }),
  ],
  providers: [
    PaymentsService,
    TransactionsService,
    WebhookService,
    WaveService,
    OMService,
    PaymentProviderService,
    TransactionFactory,
  ],
  controllers: [PaymentsController, WebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
