import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../lib';
import appConfig from '../config/app.config';
import { ProjectModule } from './projects/project.module';
import { UsersModule } from './users/user.module';
import { ProvidersModules } from './providers/providers.module';
import { PaymentsModule } from './payments/payments.module';
import { SessionPaymentModule } from './payments/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig],
    }),
    CommonModule,
    UsersModule,
    ProjectModule,
    ProvidersModules,
    PaymentsModule,
    SessionPaymentModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
