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
import { TokensService } from '../services/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    KeyvModule,
    SeedersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
    PaginationService,
    FilterService,
    HashService,
    LoggerService,
    TokensService,
  ],
  exports: [
    PrismaService,
    PaginationService,
    FilterService,
    HashService,
    LoggerService,
    KeyvModule,
    TokensService,
    JwtModule,
  ],
  controllers: [HealthController],
})
export class CommonModule {}
