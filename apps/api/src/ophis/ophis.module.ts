import { Module } from '@nestjs/common';
import { OphisService } from './ophis.service';
import { OphisController } from './ophis.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OphisController],
  providers: [OphisService],
})
export class OphisModule {}
