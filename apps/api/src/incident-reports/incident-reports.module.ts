import { Module, forwardRef } from '@nestjs/common';
import { IncidentReportsService } from './incident-reports.service';
import { IncidentReportsController } from './incident-reports.controller';
import { AuthModule } from '../auth/auth.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [forwardRef(() => AuthModule), PlayersModule],
  controllers: [IncidentReportsController],
  providers: [IncidentReportsService],
  exports: [IncidentReportsService],
})
export class IncidentReportsModule {}
