import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from 'src/lib';

@Injectable()
export class WebhookConfigService {
  private readonly logger = new Logger(WebhookConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getWebhookConfigByProvider(providerCode: string) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: providerCode.toUpperCase() },
      include: { webhookConfig: true },
    });

    if (!provider) {
      throw new NotFoundException(`Provider ${providerCode} non trouvé`);
    }

    if (!provider.webhookConfig) {
      throw new NotFoundException(
        `Configuration webhook non trouvée pour ${providerCode}`,
      );
    }

    const webhookPath = providerCode.toLowerCase().replace('_', '-');

    return {
      ...this.sanitizeWebhookConfig(provider.webhookConfig),
      webhookUrl: this.getWebhookUrl(webhookPath),
    };
  }

  async listAllWebhookConfigs() {
    const providers = await this.prisma.paymentProvider.findMany({
      include: { webhookConfig: true },
      where: {
        webhookConfig: { isNot: null },
      },
    });

    return providers.map((provider) => ({
      provider: {
        code: provider.code,
        name: provider.name,
      },
      config: provider.webhookConfig
        ? this.sanitizeWebhookConfig(provider.webhookConfig)
        : null,
      webhookUrl: provider.webhookConfig
        ? this.getWebhookUrl(provider.code.toLowerCase().replace('_', '-'))
        : null,
    }));
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getWebhookUrl(path: string): string {
    const appDomain = this.config.get('APP_DOMAIN');

    if (!appDomain) {
      this.logger.warn('APP_DOMAIN not configured, using default localhost');
      return `https://localhost:3000/webhook/${path}`;
    }

    // S'assurer que l'URL commence par https://
    const domain = appDomain.startsWith('https')
      ? appDomain
      : `https://${appDomain.replace('http://', '')}`;

    return `${domain}/webhook/${path}`;
  }

  generateSecureSecret(prefix: string): string {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomBytes}`;
  }

  sanitizeWebhookConfig(config: any) {
    // Ne pas exposer le secret complet, juste les premiers/derniers caractères
    const maskedSecret =
      config.secret.length > 20
        ? `${config.secret.substring(0, 10)}...${config.secret.substring(config.secret.length - 10)}`
        : '***';

    return {
      id: config.id,
      authType: config.authType,
      header: config.header,
      prefix: config.prefix,
      secretPreview: maskedSecret,
      algo: config.algo,
      encoding: config.encoding,
      timestampTolerance: config.timestampTolerance,
      bodyFormat: config.bodyFormat,
      isActive: config.isActive,
      lastVerifiedAt: config.lastVerifiedAt,
      lastTestedAt: config.lastTestedAt,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}
