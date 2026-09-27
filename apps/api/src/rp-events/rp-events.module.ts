import { Module } from '@nestjs/common';
import { RpEventsService } from './rp-events.service';
import { RpEventsController } from './rp-events.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RpEventsController],
  providers: [RpEventsService],
  exports: [RpEventsService],
})
export class RpEventsModule {}
