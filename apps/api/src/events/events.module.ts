import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { AuthModule } from '../auth/auth.module';
import { PlayersModule } from '../players/players.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [AuthModule, PlayersModule, SyncModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
