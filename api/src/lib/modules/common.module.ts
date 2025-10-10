import { Global, Module } from '@nestjs/common';
import {
  FilterService,
  HashService,
  PaginationService,
  PrismaService,
} from '../services';
import { LoggerService } from '../services/logger.service';
import { KeyvModule } from './keyv.module';
import { HealthController } from '../controllers/health.controller';
import { SeedersModule } from './seeders/seeders.module';

@Global()
@Module({
  imports: [KeyvModule, SeedersModule],
  providers: [
    PrismaService,
    PaginationService,
    FilterService,
    HashService,
    LoggerService,
  ],
  exports: [
    PrismaService,
    PaginationService,
    FilterService,
    HashService,
    LoggerService,
    KeyvModule,
  ],
  controllers: [HealthController],
})
export class CommonModule {}
