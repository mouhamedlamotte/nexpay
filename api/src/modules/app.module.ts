import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../lib';
import appConfig from '../config/app.config';
import { TransactionsModule } from './transactions/transactions.module';
import { ProjectModule } from './projects/project.module';
import { PaymentProviderModule } from './settings/providers/payment-provider.module';
import { CallbacksModule } from './settings/callbacks/redirects.module';
import { WebhooksModule } from './settings/webhooks/webhooks.module';
import { PaymentsModule } from './public/payments/webhook/payments.module';
import { SeedersModule } from 'src/lib/modules/seeders/seeders.module';
import { UsersModule } from './users/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SessionPaymentModule } from './public/payments/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig],
    }),
    SeedersModule,
    CommonModule,
    CallbacksModule,
    WebhooksModule,
    PaymentProviderModule,
    ProjectModule,
    TransactionsModule,
    PaymentsModule,
    SessionPaymentModule,
    UsersModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
