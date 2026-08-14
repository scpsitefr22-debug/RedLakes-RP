import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token =
      req.cookies?.['redlakes_token'] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('Non authentifié');

    const user = await this.auth.validateSession(token);
    if (!user) throw new UnauthorizedException('Session expirée');

    req.user = user;
    return true;
  }
}
