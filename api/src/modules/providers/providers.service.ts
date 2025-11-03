import { Injectable, NotFoundException } from '@nestjs/common';
import { HashService, PrismaService } from 'src/lib';
import { LoggerService } from 'src/lib/services/logger.service';
import { UpdatePaymentProviderSecretsDto } from './dto/update-payment-provider.dto';
import { FilterConfig, FilterService } from 'src/lib/services/filter.service';
import { PaginationService } from 'src/lib/services/pagination.service';
import { GetPaymentProviderDto } from './dto/get-payment-provider.dto';
import { InitiatePaymentDto } from 'src/modules/payments/dto/initiate-payment.dto';
import { TestPaymentDto } from './dto/test-payment.dto';
import { ConfigService } from '@nestjs/config';
import { SessionPayemtService } from 'src/modules/payments/session/session.service';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly pagination: PaginationService,
    private readonly filter: FilterService,
    private readonly sessionService: SessionPayemtService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(ProvidersService.name);
  }

  private async handleError<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private ProvidersFilterconfig(): FilterConfig {
    return {
      searchConfig: {
        searchKey: 'search',
        searchFields: ['name', 'code'],
      },
    };
  }

  async update(code: string, dto: UpdatePaymentProviderSecretsDto) {
    return this.handleError(async () => {
      const provider = await this.getProviderByCode(code);
      if (!provider) throw new NotFoundException('Provider not found');

      // Parse existing secrets from database
      let existingSecrets: Record<string, string> = {};
      try {
        if (provider.secrets && typeof provider.secrets === 'string') {
          existingSecrets = JSON.parse(provider.secrets);
        }
      } catch (e) {
        console.error('Failed to parse existing secrets:', e);
      }

      // Merge new secrets with existing encrypted ones
      // New secrets (plain text) override existing ones (encrypted)
      const mergedSecrets = { ...existingSecrets, ...dto.secrets };

      // Decrypt and validate all secrets (this method handles both encryption check and validation)
      const decryptedSecrets = await this.hash.validateAndDecryptSecrets(
        mergedSecrets,
        provider.secretsFields,
        provider.name,
      );

      // Re-encrypt all decrypted secrets
      const reEncryptedSecrets = await this.hash.validateAndEncryptSecrets(
        decryptedSecrets,
        provider.secretsFields,
        provider.name,
      );

      return this.prisma.paymentProvider.update({
        where: { code },
        data: { secrets: JSON.stringify(reEncryptedSecrets) },
        omit: { secrets: true },
      });
    });
  }

  async toggle(code: string, isActive: boolean) {
    return this.handleError(() =>
      this.prisma.paymentProvider.update({
        where: { id: code },
        data: { isActive },
      }),
    );
  }

  async findAll(dto: GetPaymentProviderDto) {
    return this.handleError(async () => {
      const config = this.ProvidersFilterconfig();
      const where = this.filter.buildDynamicFilters(dto, config);
      const orderBy = this.pagination.buildOrderBy(dto.sortBy, dto.sortOrder);

      return this.pagination.paginate(this.prisma.paymentProvider, {
        page: dto.page,
        limit: dto.limit,
        where,
        orderBy,
      });
    });
  }

  async testSecret(userId: string, code: string, dto: TestPaymentDto) {
    return this.handleError(async () => {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const cancelUrl = `${this.config.get('url')}/checkout/cancel`;
      const successUrl = `${this.config.get('url')}/checkout/success`;

      const data: InitiatePaymentDto = {
        ...dto,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        userId: user.id,
        provider: code,
        cancelUrl,
        successUrl,
      };

      if (!user) throw new NotFoundException('User not found');
      const session = await this.sessionService.initiateSessionPayment(data);
      const checkout = await this.sessionService.checkoutSessionPayment(
        session.sessionId,
        { provider: code },
      );
      if (checkout) {
        await this.prisma.paymentProvider.update({
          where: { code },
          data: { hasValidSecretConfig: true },
        });
        return checkout;
      }
    });
  }

  async getProviderByCode(code: string) {
    return this.handleError(() =>
      this.prisma.paymentProvider.findUnique({ where: { code } }),
    );
  }

  async getProviderById(id: string) {
    return this.handleError(() =>
      this.prisma.paymentProvider.findUnique({ where: { id } }),
    );
  }
}
