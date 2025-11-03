import { Module } from '@nestjs/common';
import { SessionPayemtService } from './session.service';
import { SessionPaymentController } from './session.controller';
import { PaymentsModule } from '../payments.module';

@Module({
  imports: [PaymentsModule],
  providers: [SessionPayemtService],
  controllers: [SessionPaymentController],
  exports: [SessionPayemtService],
})
export class SessionPaymentModule {}
