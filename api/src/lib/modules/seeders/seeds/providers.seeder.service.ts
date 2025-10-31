import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/lib/services';
import { LoggerService } from 'src/lib/services/logger.service';

type Provider = {
  name: string;
  code: string;
  logoUrl: string;
  secretsFields: string[];
};

const LOGO_URL = `https://${process.env.APP_DOMAIN}/${process.env.GLOBAL_PREFIX}/media/images/logos`;

const SEED_PROVIDERS: Provider[] = [
  {
    name: 'Orange Money',
    code: 'om',
    logoUrl: `${LOGO_URL}/om.png`,
    secretsFields: ['client_id', 'client_secret', 'name', 'code'],
  },
  {
    name: 'Wave',
    code: 'wave',
    logoUrl: `${LOGO_URL}/wave.png`,
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
        update: {
          name: provider.name,
          logoUrl: provider.logoUrl,
          secretsFields: provider.secretsFields,
        },
        create: provider,
      });
    }
  }

  async onModuleInit() {
    await this.seed();
    this.logger.log('Providers seeded');
  }
}
