import { Module } from '@nestjs/common';
import { CoreMessagesService } from './core-messages.service';
import { CoreMessagesController } from './core-messages.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CoreMessagesController],
  providers: [CoreMessagesService],
})
export class CoreMessagesModule {}
