import { Global, Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { AuditService } from './audit.service';
import { CommentsService } from './comments.service';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [PlatformController],
  providers: [AuditService, CommentsService, NotificationsService],
  exports: [AuditService, CommentsService, NotificationsService],
})
export class PlatformModule {}
