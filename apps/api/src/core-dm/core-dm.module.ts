import { Module } from '@nestjs/common';
import { CoreDmService } from './core-dm.service';
import { CoreDmController } from './core-dm.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CoreDmController],
  providers: [CoreDmService],
})
export class CoreDmModule {}
