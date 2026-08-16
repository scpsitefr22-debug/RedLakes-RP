import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { OptionalAuthGuard } from './optional-auth.guard';
import { RolesGuard } from './roles.guard';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [forwardRef(() => SyncModule)],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, AuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}
