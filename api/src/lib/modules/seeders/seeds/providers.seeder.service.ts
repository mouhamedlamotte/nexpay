import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/lib/services';
import { LoggerService } from 'src/lib/services/logger.service';

type Provider = {
  name: string;
  code: string;
  secretsFields: string[];
};

const SEED_PROVIDERS: Provider[] = [
  {
    name: 'Orange Money',
    code: 'om',
    secretsFields: ['client_id', 'client_secret', 'name', 'code'],
  },
  {
    name: 'Wave',
    code: 'wave',
    secretsFields: ['api_key'],
  },
];

@Injectable()
export class ProvidersSeedersService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ProvidersSeedersService.name);
  }
  async seed() {
    for (const provider of SEED_PROVIDERS) {
      await this.prisma.paymentProvider.upsert({
        where: { code: provider.code },
        update: {},
        create: provider,
      });
    }
  }

  async onModuleInit() {
    await this.seed();
    this.logger.log('Providers seeded');
  }
}
