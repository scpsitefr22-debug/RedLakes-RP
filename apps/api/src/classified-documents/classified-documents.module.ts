import { Module, forwardRef } from '@nestjs/common';
import { ClassifiedDocumentsService } from './classified-documents.service';
import { ClassifiedDocumentsController } from './classified-documents.controller';
import { AuthModule } from '../auth/auth.module';
import { PlayersModule } from '../players/players.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [forwardRef(() => AuthModule), PlayersModule, SyncModule],
  controllers: [ClassifiedDocumentsController],
  providers: [ClassifiedDocumentsService],
  exports: [ClassifiedDocumentsService],
})
export class ClassifiedDocumentsModule {}
