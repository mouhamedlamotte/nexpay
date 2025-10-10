import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
