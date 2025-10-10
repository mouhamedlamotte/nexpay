import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FilterConfig,
  FilterService,
  HashService,
  LoggerService,
  PaginationService,
  PrismaService,
} from 'src/lib';
import { UpdateWebhooksConfigDto } from './dto/update-webhooks-config.dto';
import { CreateWebhooksConfigDto } from './dto/create-webhooks-config.dto';
import { GetWebhookConfigDto } from './dto/get-webhook-config.dto';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly hash: HashService,
    private readonly filter: FilterService,
    private readonly pagination: PaginationService,
  ) {
    this.logger.setContext(WebhooksService.name);
  }

  private getWebhooksFilterConfig(projectId: string): FilterConfig {
    return {
      baseWhere: {
        projectId,
      },
      searchConfig: {
        searchKey: 'search',
        searchFields: ['url', 'header'],
        mode: 'insensitive',
        operator: 'contains',
      },
    };
  }

  async findOne(id: string) {
    try {
      const config = await this.prisma.webhook.findUnique({
        where: { id },
        omit: { secret: true },
      });
      if (!config) {
        throw new NotFoundException('No webhook config found');
      }
      return config;
    } catch (error) {
      this.logger.error('Error fetching redirect config', error);
      throw error;
    }
  }

  async findAll(projectId: string, dto: GetWebhookConfigDto) {
    try {
      const filterConfig = this.getWebhooksFilterConfig(projectId);
      const where = this.filter.buildDynamicFilters(dto, filterConfig);

      const orderBy = this.pagination.buildOrderBy(dto.sortBy, dto.sortOrder);

      return this.pagination.paginate(this.prisma.webhook, {
        page: dto.page,
        limit: dto.limit,
        where,
        orderBy,
        select: {
          id: true,
          secret: false,
          url: true,
          header: true,
        },
      });
    } catch (error) {
      this.logger.error('Error fetching redirect config', error);
      throw error;
    }
  }

  async create(projectId: string, data: CreateWebhooksConfigDto) {
    try {
      if (data.secret) {
        data.secret = await this.hash.encryptSensitiveData(data.secret);
      }
      return await this.prisma.webhook.upsert({
        where: { id: projectId },
        create: {
          projectId,
          ...data,
        },
        update: {
          ...data,
        },
      });
    } catch (error) {
      this.logger.error('Error creating redirect config', error);
      throw error;
    }
  }

  async update(projectId: string, id: string, data: UpdateWebhooksConfigDto) {
    try {
      if (data.secret) {
        data.secret = await this.hash.encryptSensitiveData(data.secret);
      }
      return await this.prisma.webhook.update({
        where: { projectId, id },
        data: {
          ...data,
        },
        omit: { secret: true },
      });
    } catch (error) {
      this.logger.error('Error updating redirect config', error);
      throw error;
    }
  }
}
