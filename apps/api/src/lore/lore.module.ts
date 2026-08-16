import { Module, forwardRef } from '@nestjs/common';
import { LoreService } from './lore.service';
import { LoreController } from './lore.controller';
import { AuthModule } from '../auth/auth.module';
import { SearchModule } from '../search/search.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [AuthModule, PlayersModule, forwardRef(() => SearchModule)],
  controllers: [LoreController],
  providers: [LoreService],
  exports: [LoreService],
})
export class LoreModule {}
