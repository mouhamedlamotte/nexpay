import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WebhookService } from './webhook/webhook.service';
import { WebhookController } from './webhook/webhook.controller';
import { WaveAdapter } from './adapters/wave.adapter';
import { OMAdapder } from './adapters/om.adapter';
import { TransactionsService } from '../projects/transactions/transactions.service';
import { TransactionFactory } from './helpers/transaction.factory';
import { WebhookAuthGuard } from 'src/guards/providers-webhook.guard';
import {
  HmacValidator,
  SharedSecretValidator,
  WebhookValidatorFactory,
} from 'src/lib/validators';
import { OMService } from 'src/modules/providers/services/om.service';
import { PayerService } from '../projects/transactions/payer.service';
import { CallbacksService } from '../projects/settings/callbacks/redirects.service';

@Module({
  imports: [
    HttpModule.register({
      maxRedirects: 5,
    }),
  ],
  providers: [
    // Services principaux
    PaymentsService,
    WebhookService,
    TransactionsService,
    OMService,
    PayerService,
    CallbacksService,

    // Adapters
    WaveAdapter,
    OMAdapder,

    // Helpers et factories
    TransactionFactory,

    // Guards et validators
    WebhookAuthGuard,
    WebhookValidatorFactory,
    SharedSecretValidator,
    HmacValidator,
  ],
  controllers: [PaymentsController, WebhookController],
  exports: [
    PaymentsService,
    WebhookService,
    TransactionsService,
    TransactionFactory,
    WaveAdapter,
    OMAdapder,
  ],
})
export class PaymentsModule {}
