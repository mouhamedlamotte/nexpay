import { SetMetadata } from '@nestjs/common';
export const WEBHOOK_PROVIDER = 'webhook_provider';

export const WebhookProvider = (providerCode: string) =>
  SetMetadata(WEBHOOK_PROVIDER, providerCode);
