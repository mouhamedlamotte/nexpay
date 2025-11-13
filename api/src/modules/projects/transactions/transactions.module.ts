import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PayerService } from './payer.service';

@Module({
  providers: [TransactionsService, PayerService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
