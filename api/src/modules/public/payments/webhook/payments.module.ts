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
import { WebhookAuthGuard } from 'src/guards/providers-webhook.guard';
import {
  HmacValidator,
  SharedSecretValidator,
  WebhookValidatorFactory,
} from 'src/lib/validators';
import { PrismaService } from 'src/lib';

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
    WebhookAuthGuard,
    WebhookValidatorFactory,
    SharedSecretValidator,
    HmacValidator,
    PrismaService,
  ],
  controllers: [PaymentsController, WebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
