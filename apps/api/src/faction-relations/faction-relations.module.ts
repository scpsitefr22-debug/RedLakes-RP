import { Module, forwardRef } from '@nestjs/common';
import { FactionRelationsService } from './faction-relations.service';
import { FactionRelationsController } from './faction-relations.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [FactionRelationsController],
  providers: [FactionRelationsService],
  exports: [FactionRelationsService],
})
export class FactionRelationsModule {}
