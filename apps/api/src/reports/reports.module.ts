import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [AuthModule, SyncModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
