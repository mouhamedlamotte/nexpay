import { Module } from '@nestjs/common';
import { WaveWebhookConfigController } from './controllers/wave-webhook-config.controller';
import { WaveWebhookConfigService } from './services/wave-webhook-config.service';
import { HttpModule } from '@nestjs/axios';
import { OMWebhookConfigController } from './controllers/om-webhook-config.controller';
import { OMWebhookConfigService } from './services/om-webhook-config.service';
import { WebhookConfigService } from './services/webhook-config.service';
import { OMService } from '../../services/om.service';
import { WebhookConfigController } from './controllers/webhook-config.controller';

@Module({
  imports: [
    HttpModule.register({
      maxRedirects: 5,
    }),
  ],
  controllers: [
    WebhookConfigController,
    WaveWebhookConfigController,
    OMWebhookConfigController,
  ],
  providers: [
    WebhookConfigService,
    WaveWebhookConfigService,
    OMWebhookConfigService,
    OMService,
  ],
})
export class WebhookConfigModule {}
