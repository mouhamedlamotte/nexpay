import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  FilterService,
  HashService,
  PaginationService,
  PrismaService,
  LoggerService,
  TokensService,
} from '../services';
import { KeyvModule } from './keyv.module';
import { SeedersModule } from './seeders/seeders.module';
import { HealthController } from '../controllers/health.controller';

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
    TokensService,
    JwtModule,
  ],
  controllers: [HealthController],
})
export class CommonModule {}
