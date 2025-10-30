import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilterConfig, FilterService } from 'src/lib/services/filter.service';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { PaginationService } from 'src/lib/services/pagination.service';
import { Currency, Prisma, PrismaService, TransactionStatus } from 'src/lib';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly filter: FilterService,
    private readonly pagination: PaginationService,
  ) {}

  private getFilterConfig(projectId: string): FilterConfig {
    return {
      baseWhere: { projectId },
      allowedFilters: [
        'currency',
        'status',
        'reference',
        'providerTransactionId',
      ],
      dateFields: [
        {
          field: 'createdAt',
          fromKey: 'createdAfter',
          toKey: 'createdBefore',
          exactKey: 'createdAt',
        },
      ],
      searchConfig: {
        searchKey: 'search',
        searchFields: ['reference', 'providerTransactionId'],
        relationSearchFields: [
          {
            relation: 'provider',
            fields: ['name', 'code'],
            isArray: false,
          },
          {
            relation: 'payer',
            fields: ['name', 'email', 'phone'],
            isArray: false,
          },
        ],
        mode: 'insensitive',
        operator: 'contains',
      },
    };
  }

  private getTransactionInclude(): Prisma.TransactionInclude {
    return {
      provider: true,
      project: true,
      payer: true,
    };
  }

  async findAll(projectId: string, dto: GetTransactionDto) {
    try {
      const config = this.getFilterConfig(projectId);
      const filters = this.filter.buildDynamicFilters(dto, config);

      const orderBy = this.pagination.buildOrderBy(dto.sortBy, dto.sortOrder);

      const include = this.getTransactionInclude();
      const result = await this.pagination.paginate(this.prisma.transaction, {
        page: dto.page,
        limit: dto.limit,
        where: filters,
        orderBy,
        include,
      });
      return result;
    } catch (error) {
      this.logger.error('Error fetching transactions', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: this.getTransactionInclude(),
      });
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      return transaction;
    } catch (error) {
      this.logger.error('Error fetching transaction', error);
      throw error;
    }
  }

  async findByReference(reference: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { reference },
        include: this.getTransactionInclude(),
      });
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      return transaction;
    } catch (error) {
      this.logger.error('Error fetching transaction by reference', error);
      throw error;
    }
  }

  async create(data: {
    amount: number;
    sessionId?: string;
    projectId: string;
    currency: Currency;
    status: TransactionStatus;
    client_reference?: string;
    reference: string;
    providerTransactionId: string;
    userId?: string;
    name?: string;
    email?: string;
    phone?: string;
    metadata?: string;
    providerId?: string;
    expiresAt?: Date;
  }) {
    try {
      const payer = await this.prisma.payer.create({
        data: {
          userId: data.userId || 'unknown',
          name: data.name || 'Unknown',
          email: data.email || 'Unknown',
          phone: data.phone || 'Unknown',
        },
      });

      if (!payer) {
        throw new Error('Payer not found or created');
      }

      let tData: any = {
        project: { connect: { id: data.projectId } },
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        clientReference: data.client_reference,
        reference: data.reference,
        providerTransactionId: data.providerTransactionId,
        metadata: data.metadata,
        payer: { connect: { id: payer.id } },
        provider: { connect: { id: data.providerId } },
        expiresAt: data.expiresAt,
      };

      if (data.sessionId) {
        tData = {
          ...tData,
          session: { connect: { id: data.sessionId } },
        };
      }

      const transaction = await this.prisma.transaction.create({
        data: tData,
        include: this.getTransactionInclude(),
      });
      return transaction;
    } catch (error) {
      this.logger.error('Error creating transaction', error);
      throw error;
    }
  }

  async updateStatus(reference: string, status: TransactionStatus) {
    try {
      await this.findByReference(reference);
      const resolvedAt = new Date();
      const transaction = await this.prisma.transaction.update({
        where: { reference },
        data: {
          status,
          resolvedAt: status === 'SUCCEEDED' ? resolvedAt : null,
        },
        include: this.getTransactionInclude(),
      });
      return transaction;
    } catch (error) {
      this.logger.error('Error updating transaction status', error);
      throw error;
    }
  }
}
