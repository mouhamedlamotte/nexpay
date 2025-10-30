import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashService, PrismaService } from 'src/lib';
import { LoggerService } from 'src/lib/services/logger.service';
import { UpdatePaymentProviderDto } from './dto/update-payment-provider.dto';
import { FilterConfig, FilterService } from 'src/lib/services/filter.service';
import { PaginationService } from 'src/lib/services/pagination.service';
import { GetPaymentProviderDto } from './dto/get-payment-provider.dto';

@Injectable()
export class PaymentProviderService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly pagination: PaginationService,
    private readonly filter: FilterService,
  ) {
    this.logger.setContext(PaymentProviderService.name);
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

  private async validateAndEncryptSecrets(
    secrets: Record<string, any>,
    secretsFields: string[],
    providerName: string,
  ): Promise<Record<string, string>> {
    // Check required fields
    for (const field of secretsFields) {
      if (!secrets[field]) {
        throw new BadRequestException(`Secret ${field} is required`);
      }
    }

    // Check for extra fields
    const extraFields = Object.keys(secrets).filter(
      (field) => !secretsFields.includes(field),
    );

    if (extraFields.length > 0) {
      throw new BadRequestException(
        `Invalid secrets, only the following field(s) are allowed for ${providerName}: ${secretsFields.join(
          ', ',
        )}`,
      );
    }

    // Hash secrets
    const encryptedSecrets: Record<string, string> = {};
    for (const field of secretsFields) {
      encryptedSecrets[field] = await this.hash.encryptSensitiveData(
        secrets[field] as string,
      );
    }

    return encryptedSecrets;
  }

  async validateAndDecryptSecrets(
    secrets: Record<string, any>,
    secretsFields: string[],
    providerName: string,
  ): Promise<Record<string, string>> {
    // Check required fields
    for (const field of secretsFields) {
      if (!secrets[field]) {
        throw new BadRequestException(
          `Secret ${field} is required for ${providerName}`,
        );
      }
    }

    // Decrypt secrets
    const decryptedSecrets: Record<string, string> = {};

    this.logger.log(`Decrypting secrets for`);
    this.logger.log(JSON.stringify(secrets, null, 2));
    for (const field of secretsFields) {
      const secretValue = secrets[field] as string;
      this.logger.log(
        `========================= Decrypting secrets for ${secretValue}`,
      );

      // Check if the value looks like encrypted data (base64 with proper structure)
      if (this.isEncryptedData(secretValue)) {
        this.logger.log(`Decrypting secret field: ${field}`);
        try {
          decryptedSecrets[field] =
            await this.hash.decryptSensitiveData(secretValue);
        } catch (error) {
          this.logger.error(`Failed to decrypt field ${field}:`, error);
          throw new BadRequestException(`Failed to decrypt secret ${field}`);
        }
      } else {
        // Assume it's plain text (could be a UUID, plain API key, etc.)
        this.logger.log(`Using plain text value for field: ${field}`);
        decryptedSecrets[field] = secretValue;
      }
    }

    return decryptedSecrets;
  }

  /**
   * Check if a string looks like encrypted data from our encryption method
   */
  private isEncryptedData(value: string): boolean {
    try {
      // Must be valid base64
      const decoded = Buffer.from(value, 'base64').toString('utf8');

      // Must be valid JSON
      const parsed = JSON.parse(decoded);

      // Must have our expected structure
      return !!(parsed.iv && parsed.authTag && parsed.encrypted);
    } catch {
      return false;
    }
  }

  async update(dto: UpdatePaymentProviderDto) {
    return this.handleError(async () => {
      const provider = await this.getProviderById(dto.providerId);
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
      const decryptedSecrets = await this.validateAndDecryptSecrets(
        mergedSecrets,
        provider.secretsFields,
        provider.name,
      );

      // Re-encrypt all decrypted secrets
      const reEncryptedSecrets = await this.validateAndEncryptSecrets(
        decryptedSecrets,
        provider.secretsFields,
        provider.name,
      );

      return this.prisma.paymentProvider.update({
        where: { id: dto.providerId },
        data: { secrets: JSON.stringify(reEncryptedSecrets) },
        omit: { secrets: true },
      });
    });
  }

  async toggle(providerId: string, isActive: boolean) {
    return this.handleError(() =>
      this.prisma.paymentProvider.update({
        where: { id: providerId },
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
