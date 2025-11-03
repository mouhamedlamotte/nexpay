import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ProviderWebhook, WebhookAlgo, WebhookEncoding } from '@prisma/client';
import * as crypto from 'crypto';
import { IWebhookValidator } from './providers-webhook-validator.interface';
import { HashService } from 'src/lib/services';

@Injectable()
export class HmacValidator implements IWebhookValidator {
  private readonly logger = new Logger(HmacValidator.name);
  constructor(private readonly hash: HashService) {}

  async validate(request: Request, config: ProviderWebhook): Promise<boolean> {
    const signatureHeader = this.getHeader(request, config.header);

    if (!signatureHeader) {
      this.logger.warn(`Missing signature header: ${config.header}`);
      return false;
    }

    // Parser le header (format Wave: t=timestamp,v1=signature,v1=signature)
    const { timestamp, signatures } =
      this.parseSignatureHeader(signatureHeader);

    if (!timestamp || signatures.length === 0) {
      this.logger.warn('Invalid signature header format');
      return false;
    }

    // Vérifier le timestamp si tolérance configurée
    if (config.timestampTolerance) {
      if (!this.isTimestampValid(timestamp, config.timestampTolerance)) {
        this.logger.warn('Timestamp too old or invalid');
        return false;
      }
    }

    // Récupérer le body brut
    const rawBody = this.getRawBody(request);

    if (!rawBody) {
      this.logger.warn('Missing raw body');
      return false;
    }

    // Construire le payload selon le format
    const payload = this.buildPayload(timestamp, rawBody, config.bodyFormat);

    // Calculer le HMAC attendu
    const expectedSignature = await this.computeHmac(
      payload,
      config.secret,
      config.algo || WebhookAlgo.sha256,
      config.encoding || WebhookEncoding.hex,
    );

    // Vérifier si une des signatures correspond
    const isValid = signatures.some((sig) =>
      this.secureCompare(sig, expectedSignature),
    );

    if (!isValid) {
      this.logger.warn('HMAC signature mismatch');
      this.logger.debug(`Expected: ${expectedSignature}`);
      this.logger.debug(`Received: ${signatures.join(', ')}`);
    }

    return isValid;
  }

  private getHeader(request: Request, headerName: string): string | undefined {
    const normalizedHeader = headerName.toLowerCase();
    return request.headers[normalizedHeader] as string;
  }

  private parseSignatureHeader(header: string): {
    timestamp: string;
    signatures: string[];
  } {
    const parts = header.split(',');
    const result = { timestamp: '', signatures: [] as string[] };

    parts.forEach((part) => {
      const [prefix, value] = part.trim().split('=');
      if (prefix === 't') {
        result.timestamp = value;
      } else if (prefix === 'v1') {
        result.signatures.push(value);
      }
    });

    return result;
  }

  private isTimestampValid(
    timestamp: string,
    toleranceSeconds: number,
  ): boolean {
    const webhookTime = parseInt(timestamp, 10);
    if (isNaN(webhookTime)) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const diff = Math.abs(currentTime - webhookTime);

    return diff <= toleranceSeconds;
  }

  private getRawBody(request: Request): string | null {
    // NestJS stocke le body brut dans request.body si on utilise le middleware approprié
    // Voir la configuration dans main.ts
    if ((request as any).rawBody) {
      return (request as any).rawBody;
    }

    // Fallback: si le body est déjà parsé, le re-stringify
    if (request.body && typeof request.body === 'object') {
      return JSON.stringify(request.body);
    }

    return null;
  }

  private buildPayload(
    timestamp: string,
    body: string,
    format?: string,
  ): string {
    if (format === 'timestampPlusBody') {
      return timestamp + body;
    }
    // Ajouter d'autres formats si nécessaire
    return timestamp + body;
  }

  private async computeHmac(
    payload: string,
    secret: string,
    algo: WebhookAlgo,
    encoding: WebhookEncoding,
  ): Promise<string> {
    const decryptedSecret = await this.hash.decryptSensitiveData(secret);
    if (decryptedSecret) {
      secret = decryptedSecret;
    }
    const hmac = crypto.createHmac(algo, secret);
    hmac.update(payload);

    switch (encoding) {
      case WebhookEncoding.hex:
        return hmac.digest('hex');
      case WebhookEncoding.base64:
        return hmac.digest('base64');
      default:
        return hmac.digest('hex');
    }
  }

  private secureCompare(a: string, b: string): boolean {
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
