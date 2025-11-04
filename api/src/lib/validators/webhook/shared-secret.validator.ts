import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ProviderWebhook, WebhookHeaderPrefix } from '@prisma/client';
import { IWebhookValidator } from './providers-webhook-validator.interface';
import * as crypto from 'crypto';
import { HashService } from 'src/lib/services';

@Injectable()
export class SharedSecretValidator implements IWebhookValidator {
  private readonly logger = new Logger(SharedSecretValidator.name);
  constructor(private readonly hash: HashService) {}

  async validate(request: Request, config: ProviderWebhook): Promise<boolean> {
    const headerValue = this.getHeader(request, config.header);

    if (!headerValue) {
      this.logger.warn(`Missing header: ${config.header}`);
      return false;
    }

    const expectedValue = await this.buildExpectedValue(
      config.secret,
      config.prefix,
    );

    const isValid = this.secureCompare(headerValue, expectedValue);

    if (!isValid) {
      this.logger.warn('Shared secret mismatch');
    }

    return isValid;
  }

  private getHeader(request: Request, headerName: string): string | undefined {
    // Normaliser le nom du header (Express met tout en minuscule)
    const normalizedHeader = headerName.toLowerCase();

    return request.headers[normalizedHeader] as string;
  }

  private async buildExpectedValue(
    secret: string,
    prefix?: WebhookHeaderPrefix,
  ): Promise<string> {
    const decryptedSecret = await this.hash.decryptSensitiveData(secret);
    if (decryptedSecret) {
      secret = decryptedSecret;
    }

    if (!prefix) return secret;

    switch (prefix) {
      case WebhookHeaderPrefix.bearer:
        return `Bearer ${secret}`;
      case WebhookHeaderPrefix.basic:
        return `Basic ${secret}`;
      default:
        return secret;
    }
  }

  private secureCompare(a: string, b: string): boolean {
    // Utiliser timingSafeEqual pour éviter les timing attacks
    if (a.length !== b.length) return false;

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    try {
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }
}
