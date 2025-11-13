import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/lib';
import { WebhookValidatorFactory } from 'src/lib/validators';

export const WEBHOOK_PROVIDER = 'webhook_provider';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebhookAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly validatorFactory: WebhookValidatorFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // * NOTE :  WE USE A DECORATOR TO PASS THE PROVIDER CODE
    const providerCode = this.reflector.get<string>(
      WEBHOOK_PROVIDER,
      context.getHandler(),
    );

    if (!providerCode) {
      this.logger.warn('No provider code specified for webhook endpoint');
      throw new UnauthorizedException('Webhook provider not configured');
    }

    try {
      // Récupérer la configuration du webhook pour ce provider
      const provider = await this.prisma.paymentProvider.findUnique({
        where: { code: providerCode },
        include: { webhookConfig: true },
      });

      if (!provider || !provider.webhookConfig) {
        this.logger.error(
          `Webhook config not found for provider: ${providerCode}`,
        );
        throw new UnauthorizedException('Webhook not configured');
      }
      // Obtenir le validateur approprié
      const validator = this.validatorFactory.getValidator(
        provider.webhookConfig.authType,
      );

      // Valider la requête
      const isValid = await validator.validate(request, provider.webhookConfig);

      if (isValid) {
        // Mettre à jour la date de dernière vérification
        await this.prisma.providerWebhook.update({
          where: { id: provider.webhookConfig.id },
          data: { lastVerifiedAt: new Date() },
        });

        this.logger.log(
          `Webhook authenticated successfully for ${providerCode}`,
        );

        await this.prisma.paymentProvider.update({
          where: { code: providerCode },
          data: { hasValidWebhookConfig: true, hasWebhookTestPassed: true },
        });
        return true;
      }

      this.logger.warn(`Webhook authentication failed for ${providerCode}`);
      throw new UnauthorizedException('Invalid webhook signature');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Webhook validation error: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Webhook validation failed');
    }
  }
}
