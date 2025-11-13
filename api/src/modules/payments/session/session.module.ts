import { Module } from '@nestjs/common';
import { SessionPaymentController } from './session.controller';
import { PaymentsModule } from '../payments.module';
import { SessionPaymentService } from './session.service';
import { CallbacksService } from 'src/modules/projects/settings/callbacks/redirects.service';
import { PayerService } from 'src/modules/projects/transactions/payer.service';
import { ProvidersService } from 'src/modules/providers/providers.service';
import { SessionRepository } from './session.repository';
import { PaymentDataService } from './payment-data.service';

@Module({
  imports: [PaymentsModule],
  providers: [
    SessionPaymentService,
    CallbacksService,
    PayerService,
    ProvidersService,
    SessionRepository,
    PaymentDataService,
  ],
  controllers: [SessionPaymentController],
  exports: [SessionPaymentService],
})
export class SessionPaymentModule {}
