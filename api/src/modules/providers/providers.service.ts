import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashService, PrismaService } from 'src/lib';
import { LoggerService } from 'src/lib/services/logger.service';
import { UpdatePaymentProviderSecretsDto } from './dto/update-payment-provider.dto';
import { FilterConfig, FilterService } from 'src/lib/services/filter.service';
import { PaginationService } from 'src/lib/services/pagination.service';
import { GetPaymentProviderDto } from './dto/get-payment-provider.dto';
import { PaymentProviderInfo } from './interface';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly pagination: PaginationService,
    private readonly filter: FilterService,
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
        data: {
          secrets: JSON.stringify(reEncryptedSecrets),
          hasValidSecretConfig: true,
          hastSecretTestPassed: false,
        },
        omit: { secrets: true },
      });
    });
  }

  async toggle(code: string, isActive: boolean) {
    try {
      if (isActive) {
        const provider = await this.getProviderByCode(code);
        if (!provider.hasValidSecretConfig)
          throw new ForbiddenException(
            'You must configure payment provider secrets before activating it',
          );
        if (!provider.hasValidWebhookConfig)
          throw new ForbiddenException(
            'You must configure payment provider webhooks before activating it',
          );
      }
      return this.prisma.paymentProvider.update({
        where: { code },
        data: { isActive },
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resetSecrets(code: string) {
    try {
      return this.prisma.paymentProvider.update({
        where: { code },
        data: {
          secrets: null,
          hasValidSecretConfig: false,
          hastSecretTestPassed: false,
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
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

  async getActiveProviders(): Promise<PaymentProviderInfo[]> {
    return this.prisma.paymentProvider.findMany({
      where: { isActive: true, hasValidSecretConfig: true },
      select: { id: true, name: true, code: true, logoUrl: true },
    });
  }

  async validateActiveProvidersExist(): Promise<void> {
    const count = await this.prisma.paymentProvider.count({
      where: { isActive: true },
    });

    if (count === 0) {
      throw new NotFoundException(
        'No payment provider is active for this app. Please add and activate configuration for your payment provider.',
      );
    }
  }
}
