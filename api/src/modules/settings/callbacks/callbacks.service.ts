import { Injectable } from '@nestjs/common';
import { LoggerService, PrismaService } from 'src/lib';
import { CallBacksDto } from './dto/callbacks.dto';

@Injectable()
export class CallbacksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
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
}
