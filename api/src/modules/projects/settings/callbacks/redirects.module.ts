import { Module } from '@nestjs/common';
import { CallbacksService } from './callbacks.service';
import { CallbacksController } from './redirects.controller';

@Module({
  providers: [CallbacksService],
  controllers: [CallbacksController],
})
export class CallbacksModule {}
