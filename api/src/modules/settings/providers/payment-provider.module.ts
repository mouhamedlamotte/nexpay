import { Module } from '@nestjs/common';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentProviderController } from './payment-provider.controller';

@Module({
  providers: [PaymentProviderService],
  controllers: [PaymentProviderController],
})
export class PaymentProviderModule {}
