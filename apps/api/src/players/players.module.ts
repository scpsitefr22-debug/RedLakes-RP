import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { AuthModule } from '../auth/auth.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [AuthModule, SyncModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
