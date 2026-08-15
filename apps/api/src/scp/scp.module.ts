import { Module } from '@nestjs/common';
import { ScpService } from './scp.service';
import { ScpController } from './scp.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScpController],
  providers: [ScpService],
  exports: [ScpService],
})
export class ScpModule {}
