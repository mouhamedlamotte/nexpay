import { Module } from '@nestjs/common';
import { ProvidersSeedersService } from './seeds/providers.seeder.service';

@Module({
  providers: [ProvidersSeedersService],
})
export class SeedersModule {}
