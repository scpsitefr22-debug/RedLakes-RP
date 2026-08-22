import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { AuthModule } from '../auth/auth.module';
import { PlatformModule } from '../platform/platform.module';

@Module({
  imports: [AuthModule, PlatformModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
