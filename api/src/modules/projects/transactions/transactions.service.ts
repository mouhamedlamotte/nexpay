import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilterConfig, FilterService } from 'src/lib/services/filter.service';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { PaginationService } from 'src/lib/services/pagination.service';
import {
  Currency,
  Prisma,
  PrismaService,
  SessionStatus,
  TransactionStatus,
} from 'src/lib';

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
      provider: {
        omit: { secrets: true },
      },
      project: true,
      session: true,
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
    phone: string;
    metadata?: string;
    providerId?: string;
    expiresAt?: Date;
  }) {
    try {
      const payerData = {
        userId: data.userId || 'unknown',
        name: data.name || 'Unknown',
        email: data.email || 'Unknown',
        phone: data.phone,
      };
      const payer = await this.prisma.payer.upsert({
        where: { phone: payerData.phone },
        update: payerData,
        create: payerData,
      });

      if (!payer) {
        throw new Error('Payer not found or created');
      }

      const tData: any = {
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
        tData.session = { connect: { id: data.sessionId } };
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
      const transaction = await this.findByReference(reference);
      const resolvedAt = new Date();
      const tData: any = {
        status,
        resolvedAt: status === 'SUCCEEDED' ? resolvedAt : null,
      };
      if (transaction.sessionId) {
        tData.session = {
          update: {
            status: this.getSessionStatus(status),
          },
        };
      }
      const updated = await this.prisma.transaction.update({
        where: { reference },
        data: tData,
        include: this.getTransactionInclude(),
      });
      return updated;
    } catch (error) {
      this.logger.error('Error updating transaction status', error);
      throw error;
    }
  }

  private getSessionStatus(status: TransactionStatus): SessionStatus {
    if (status === 'SUCCEEDED') {
      return 'completed';
    } else if (status === 'FAILED') {
      return 'failed';
    } else if (status === 'EXPIRED') {
      return 'expired';
    } else {
      return 'closed';
    }
  }
}
