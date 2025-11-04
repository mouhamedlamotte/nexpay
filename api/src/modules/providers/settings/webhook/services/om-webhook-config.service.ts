import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WebhookAuthType, WebhookHeaderPrefix } from '@prisma/client';
import { ConfigureOmWebhookDto } from '../dto/configure-om-webhook.dto';
import { HashService, ORANGE_MONEY_API_URL, PrismaService } from 'src/lib';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebhookConfigService } from './webhook-config.service';
import { OMService } from '../../../services/om.service';

@Injectable()
export class OMWebhookConfigService {
  private readonly logger = new Logger(OMWebhookConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly weebhookConfigService: WebhookConfigService,
    private readonly om: OMService,
    private readonly http: HttpService,
    private readonly hash: HashService,
  ) {}

  async configureOmWebhook(dto: ConfigureOmWebhookDto) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: 'om' },
      include: { webhookConfig: true },
    });

    if (!provider) {
      throw new NotFoundException('Provider Orange Money non trouvé');
    }

    if (!dto.secret && !dto.autoConfigure) {
      throw new BadRequestException(
        'You need to provide a secret if you want to configure the webhook manually',
      );
    }

    let secret;
    if (!dto.secret) {
      const generatedSecret =
        await this.weebhookConfigService.generateSecureSecret('nexpay_om_WHS');
      secret = await this.hash.encryptSensitiveData(generatedSecret);
    }

    if (dto.autoConfigure) {
      return await this.autoConfigureOmWebhook(secret);
    }

    // Configuration Orange Money (toujours Basic Auth)
    const omConfig = {
      authType: WebhookAuthType.sharedSecret,
      header: 'Authorization',
      prefix: WebhookHeaderPrefix.basic,
      secret,
      algo: null,
      encoding: null,
      timestampTolerance: null,
      bodyFormat: null,
    };

    const data = await this.prisma.providerWebhook.upsert({
      where: { providerId: provider.id },
      update: omConfig,
      create: {
        ...omConfig,
        providerId: provider.id,
      },
    });

    await this.prisma.paymentProvider.update({
      where: { id: data.providerId },
      data: { hasValidWebhookConfig: true },
    });

    return this.weebhookConfigService.sanitizeWebhookConfig(data);
  }

  async autoConfigureOmWebhook(hashedSecret?: string) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: 'om' },
      include: { webhookConfig: true },
    });

    if (!provider) {
      throw new NotFoundException('Provider Orange Money non trouvé');
    }

    if (!provider.secrets) {
      throw new BadRequestException(
        "Secrets Orange Money non configurés. Veuillez d'abord configurer le provider.",
      );
    }

    const secrets = await this.hash.validateAndDecryptSecrets(
      typeof provider.secrets === 'string'
        ? JSON.parse(provider.secrets)
        : provider.secrets,
      provider.secretsFields,
      provider.name,
    );

    const authToken = await this.om.getToken({
      client_id: secrets.client_id,
      client_secret: secrets.client_secret,
    });

    let secret;

    // Générer un secret aléatoire sécurisé
    if (hashedSecret && this.hash.isEncryptedData(hashedSecret)) {
      secret = hashedSecret;
    }
    if (!secret) {
      const newSecret =
        this.weebhookConfigService.generateSecureSecret('nexpay_om_WHS');
      secret = await this.hash.encryptSensitiveData(newSecret);
    }

    // URL du webhook
    const webhookUrl = this.weebhookConfigService.getWebhookUrl('om');

    // Déterminer l'environnement
    const omApiUrl = ORANGE_MONEY_API_URL;

    const decryptedSecret = await this.hash.decryptSensitiveData(secret);

    try {
      const OmWebhookData = {
        apiKey: decryptedSecret,
        callbackUrl: webhookUrl,
        code: secrets.code,
        name: secrets.name,
      };
      // Appeler l'API Orange Money pour configurer le callback
      const response = await firstValueFrom(
        this.http.post(
          `${omApiUrl}/api/notification/v1/merchantcallback`,
          OmWebhookData,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        ),
      );

      this.logger.log(
        `Orange Money callback registered successfully: ${webhookUrl}`,
      );

      // Configurer le webhook dans notre DB
      const omConfig = {
        authType: WebhookAuthType.sharedSecret,
        header: 'Authorization',
        prefix: WebhookHeaderPrefix.basic,
        secret: hashedSecret,
        algo: null,
        encoding: null,
        timestampTolerance: null,
        bodyFormat: null,
      };

      const webhookConfig = await this.prisma.providerWebhook.upsert({
        where: { providerId: provider.id },
        update: omConfig,
        create: {
          ...omConfig,
          providerId: provider.id,
        },
      });

      await this.prisma.paymentProvider.update({
        where: { id: webhookConfig.providerId },
        data: { hasValidWebhookConfig: true },
      });
      return {
        ...this.weebhookConfigService.sanitizeWebhookConfig(webhookConfig),
        webhookUrl,
        orangeMoneyResponse: response.data,
        message: 'Webhook Orange Money configuré automatiquement avec succès',
      };
    } catch (error) {
      this.logger.error(
        'Failed to auto-configure Orange Money webhook',
        error.response?.data || error.message,
      );

      throw new BadRequestException(
        `Échec de la configuration automatique: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getOmWebhookConfig() {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: 'om' },
      include: { webhookConfig: true },
    });

    if (!provider || !provider.webhookConfig) {
      throw new NotFoundException('Configuration Orange Money non trouvée');
    }

    return {
      ...this.weebhookConfigService.sanitizeWebhookConfig(
        provider.webhookConfig,
      ),
      webhookUrl: this.weebhookConfigService.getWebhookUrl('om'),
    };
  }

  async updateOmWebhookSecret(newSecret: string) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { code: 'om' },
      include: { webhookConfig: true },
    });

    if (!provider || !provider.webhookConfig) {
      throw new NotFoundException('Configuration Orange Money non trouvée');
    }

    const secret = await this.hash.encryptSensitiveData(newSecret);

    const updated = await this.prisma.providerWebhook.update({
      where: { id: provider.webhookConfig.id },
      data: { secret },
    });

    this.logger.warn(
      '⚠️ Orange Money webhook secret rotated. IMPORTANT: Vous devez aussi mettre à jour le secret côté Orange Money via leur API!',
    );

    return {
      ...this.weebhookConfigService.sanitizeWebhookConfig(updated),
      warning:
        "N'oubliez pas de mettre à jour le secret dans Orange Money via leur API",
    };
  }
}
