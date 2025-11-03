import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { WebhookConfigModule } from './settings/webhook/webhook-config.module';
import { SessionPaymentModule } from '../payments/session/session.module';

@Module({
  imports: [WebhookConfigModule, SessionPaymentModule],
  providers: [ProvidersService],
  controllers: [ProvidersController],
  exports: [ProvidersService],
})
export class ProvidersModules {}
