import { Module } from '@nestjs/common';
import { ProvidersSeedersService } from './services/providers.seeder.service';

@Module({
  providers: [ProvidersSeedersService],
})
export class SeedersModule {}
