import { Injectable, NotFoundException } from '@nestjs/common';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { WaveService } from './adapters/wave.service';
import { OMService } from './adapters/om.service';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/lib';
import { LoggerService } from 'src/lib/services/logger.service';
import { PaymentAdapter } from './adapters/interface';
import { PaymentProviderService } from 'src/modules/settings/providers/payment-provider.service';

@Injectable()
export class PaymentsService {
  private readonly adapters: Record<string, PaymentAdapter>;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly wave: WaveService,
    private readonly om: OMService,
    private readonly providerService: PaymentProviderService,
  ) {
    this.logger.setContext(PaymentsService.name);
    this.adapters = {
      wave: this.wave,
      om: this.om,
    };
  }

  async initiatePayment(data: InitiatePaymentDto) {
    try {
      const provider = await this.prisma.paymentProvider.findFirst({
        where: { code: data.provider, isActive: true },
      });
      if (!provider) {
        throw new NotFoundException('Provider not valid for this organization');
      }

      const secrets = await this.providerService.validateAndDecryptSecrets(
        typeof provider.secrets === 'string'
          ? JSON.parse(provider.secrets)
          : provider.secrets,
        provider.secretsFields,
        provider.name,
      );

      console.log('secrets', secrets);

      const adapter = this.adapters[provider.code];
      if (!adapter) throw new NotFoundException('Provider not supported');

      return adapter.initiate({
        ...data,
        reference: this.generateReference(),
        secrets,
        currency: data.currency || 'XOF',
        providerId: provider.id,
      });
    } catch (error) {
      this.logger.error('Error initiating payment', error);
      throw error;
    }
  }

  private generateReference(): string {
    return `NEXPAY_TX_${randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  }
}
