import { ProviderWebhook } from '@prisma/client';
import { Request } from 'express';

export interface IWebhookValidator {
  validate(request: Request, config: ProviderWebhook): Promise<boolean>;
}
