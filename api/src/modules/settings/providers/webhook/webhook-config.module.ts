import { Module } from '@nestjs/common';
import { WaveWebhookConfigController } from './controllers/wave-webhook-config.controller';
import { WaveWebhookConfigService } from './services/wave-webhook-config.service';
import { OMService } from 'src/modules/public/payments/adapters/om.service';
import { PaymentProviderService } from '../payment-provider.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionFactory } from 'src/modules/public/payments/helpers/transaction.factory';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { OMWebhookConfigController } from './controllers/om-webhook-config.controller';
import { OMWebhookConfigService } from './services/om-webhook-config.service';
import { WebhookConfigService } from './services/webhook-config.service';

@Module({
  imports: [
    HttpModule.register({
      maxRedirects: 5,
    }),
  ],
  controllers: [WaveWebhookConfigController, OMWebhookConfigController],
  providers: [
    WebhookConfigService,
    WaveWebhookConfigService,
    OMWebhookConfigService,
    PaymentProviderService,
    OMService,
    TransactionsService,
    TransactionFactory,
  ],
})
export class WebhookConfigModule {}
