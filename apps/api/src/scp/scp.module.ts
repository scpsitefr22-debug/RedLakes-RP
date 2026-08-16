import { Module } from '@nestjs/common';
import { ScpService } from './scp.service';
import { ScpController } from './scp.controller';
import { AuthModule } from '../auth/auth.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [AuthModule, PlayersModule],
  controllers: [ScpController],
  providers: [ScpService],
  exports: [ScpService],
})
export class ScpModule {}
