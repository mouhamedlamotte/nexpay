import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/lib';
import { PayerUpsertData } from './interface';

@Injectable()
export class PayerService {
  private readonly logger = new Logger(PayerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upsertPayer(data: PayerUpsertData) {
    try {
      const { phone, ...updateData } = data;

      return await this.prisma.payer.upsert({
        where: { phone },
        update: updateData,
        create: data,
      });
    } catch (error) {
      this.logger.error(
        `Failed to upsert payer with phone ${data.phone}`,
        error,
      );
      throw new Error(`Payer operation failed: ${error.message}`);
    }
  }
}
