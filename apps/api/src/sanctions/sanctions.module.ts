import { Module } from '@nestjs/common';
import { SanctionsService } from './sanctions.service';
import { SanctionsController } from './sanctions.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SanctionsController],
  providers: [SanctionsService],
  exports: [SanctionsService],
})
export class SanctionsModule {}
