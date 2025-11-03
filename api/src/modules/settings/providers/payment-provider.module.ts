import { Module } from '@nestjs/common';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentProviderController } from './payment-provider.controller';
import { WebhookConfigModule } from './webhook/webhook-config.module';

@Module({
  imports: [WebhookConfigModule],
  providers: [PaymentProviderService],
  controllers: [PaymentProviderController],
})
export class PaymentProviderModule {}
