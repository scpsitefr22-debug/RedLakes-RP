import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';
import { SyncModule } from '../sync/sync.module';
import { GradesModule } from '../grades/grades.module';

@Module({
  imports: [AuthModule, SyncModule, GradesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
