import { Injectable } from '@nestjs/common';
import { LoggerService, PrismaService } from 'src/lib';
import { CallBacksDto } from './dto/callbacks.dto';
import { CallbackUrls } from './interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CallbacksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(CallbacksService.name);
  }

  async findOne(projectId: string) {
    try {
      const callbacks = await this.prisma.callback.findUnique({
        where: { projectId },
      });
      return callbacks;
    } catch (error) {
      this.logger.error('Error fetching callbacks config', error);
      throw error;
    }
  }

  async create(projectId: string, data: CallBacksDto) {
    try {
      return await this.prisma.callback.upsert({
        where: { projectId },
        create: {
          projectId,
          ...data,
        },
        update: {
          ...data,
        },
      });
    } catch (error) {
      this.logger.error('Error creating callbacks config', error);
      throw error;
    }
  }

  async update(projectId: string, data: CallBacksDto) {
    try {
      return await this.prisma.callback.update({
        where: { projectId },
        data: {
          ...data,
        },
      });
    } catch (error) {
      this.logger.error('Error updating redirect config', error);
      throw error;
    }
  }

  async getCallbackUrls(projectId: string): Promise<CallbackUrls> {
    const callbacks = await this.prisma.callback.findUnique({
      where: { projectId },
      select: { successUrl: true, failureUrl: true },
    });

    return {
      successUrl: callbacks?.successUrl ?? undefined,
      failureUrl: callbacks?.failureUrl ?? undefined,
    };
  }

  mergeCallbackUrls(
    dtoUrls: CallbackUrls,
    defaultUrls: CallbackUrls,
  ): CallbackUrls {
    const APP_URL = this.config.get('app.url');
    const defaultSystemUrls = {
      successUrl: `${APP_URL}/checkout/success`,
      failureUrl: `${APP_URL}/checkout/failed`,
    };
    return {
      successUrl:
        dtoUrls.successUrl ||
        defaultUrls.successUrl ||
        defaultSystemUrls.successUrl,
      failureUrl:
        dtoUrls.failureUrl ||
        defaultUrls.failureUrl ||
        defaultSystemUrls.failureUrl,
    };
  }
}
