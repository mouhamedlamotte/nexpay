import { Module } from '@nestjs/common';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentProviderController } from './payment-provider.controller';
import { WebhookConfigModule } from './webhook/webhook-config.module';
import { PaymentsModule } from 'src/modules/public/payments/webhook/payments.module';

@Module({
  imports: [WebhookConfigModule, PaymentsModule],
  providers: [PaymentProviderService],
  controllers: [PaymentProviderController],
})
export class PaymentProviderModule {}
