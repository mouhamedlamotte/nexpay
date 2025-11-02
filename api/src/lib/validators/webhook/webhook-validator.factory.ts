import { Injectable } from '@nestjs/common';
import { WebhookAuthType } from '@prisma/client';
import { SharedSecretValidator } from './shared-secret.validator';
import { HmacValidator } from './hmac.validator';
import { IWebhookValidator } from './providers-webhook-validator.interface';

@Injectable()
export class WebhookValidatorFactory {
  constructor(
    private readonly sharedSecretValidator: SharedSecretValidator,
    private readonly hmacValidator: HmacValidator,
  ) {}

  getValidator(authType: WebhookAuthType): IWebhookValidator {
    switch (authType) {
      case WebhookAuthType.sharedSecret:
        return this.sharedSecretValidator;
      case WebhookAuthType.hmac:
        return this.hmacValidator;
      default:
        throw new Error(`Unsupported auth type: ${authType}`);
    }
  }
}
