import { Module } from '@nestjs/common';
import { SessionPayemtService } from './session.service';
import { SessionPaymentController } from './session.controller';
import { PaymentsModule } from '../webhook/payments.module';

@Module({
  imports: [PaymentsModule],
  providers: [SessionPayemtService],
  controllers: [SessionPaymentController],
})
export class SessionPaymentModule {}
