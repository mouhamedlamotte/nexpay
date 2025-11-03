import { Module } from '@nestjs/common';
import { ProjectsController } from './project.controller';
import { ProjectService } from './project.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { CallbacksModule } from './settings/callbacks/redirects.module';
import { WebhooksModule } from './settings/webhooks/webhooks.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    DashboardModule,
    CallbacksModule,
    WebhooksModule,
    TransactionsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectService],
})
export class ProjectModule {}
