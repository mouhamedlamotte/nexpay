import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  WebhookAuthType,
  WebhookAlgo,
  WebhookEncoding,
  WebhookHeaderPrefix,
  bodyFormat,
} from '@prisma/client';
import {
  ConfigureWaveWebhookDto,
  WaveWebhookAuthType,
} from '../dto/configure-wave-webhook.dto';
import { HashService, PrismaService } from 'src/lib';
import { WebhookConfigService } from './webhook-config.service';

@Injectable()
export class WaveWebhookConfigService {
  private readonly logger = new Logger(WaveWebhookConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wehbookConfigService: WebhookConfigService,
    private readonly hash: HashService,
  ) {}
  async configureWaveWebhook(dto: ConfigureWaveWebhookDto) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: 'wave' },
      include: { webhookConfig: true },
    });

    if (!provider) {
      throw new NotFoundException('Provider Wave non trouvé');
    }

    // Configuration Wave selon le type d'auth
    const waveConfig = await this.getWaveWebhookConfigData(dto);

    const data = await this.prisma.providerWebhook.upsert({
      where: { providerId: provider.id },
      update: waveConfig,
      create: {
        ...waveConfig,
        providerId: provider.id,
      },
    });

    await this.prisma.paymentProvider.update({
      where: { id: data.providerId },
      data: { hasValidWebhookConfig: true },
    });

    return this.wehbookConfigService.sanitizeWebhookConfig(data);
  }

  private async getWaveWebhookConfigData(dto: ConfigureWaveWebhookDto) {
    const secret = await this.hash.encryptSensitiveData(dto.secret);
    const baseConfig = {
      secret,
    };

    if (dto.authType === WaveWebhookAuthType.SHARED_SECRET) {
      return {
        ...baseConfig,
        authType: WebhookAuthType.sharedSecret,
        header: 'Authorization',
        prefix: WebhookHeaderPrefix.bearer,
        algo: null,
        encoding: null,
        timestampTolerance: null,
        bodyFormat: null,
      };
    } else {
      return {
        ...baseConfig,
        authType: WebhookAuthType.hmac,
        header: 'Wave-Signature',
        prefix: null,
        algo: WebhookAlgo.sha256,
        encoding: WebhookEncoding.hex,
        timestampTolerance: 300, // 5 minutes
        bodyFormat: bodyFormat.timestampPlusBody,
      };
    }
  }

  async getWaveWebhookConfig() {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: 'wave' },
      include: { webhookConfig: true },
    });

    if (!provider || !provider.webhookConfig) {
      throw new NotFoundException('Configuration Wave non trouvée');
    }

    return {
      ...this.wehbookConfigService.sanitizeWebhookConfig(
        provider.webhookConfig,
      ),
      webhookUrl: this.wehbookConfigService.getWebhookUrl('wave'),
    };
  }
}
