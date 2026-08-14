import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-redlakes-sync-key'];
    const expected = this.config.get<string>('SYNC_API_KEY');

    if (!expected) {
      throw new UnauthorizedException("SYNC_API_KEY non configurée sur l'API");
    }
    if (!key || key !== expected) {
      throw new UnauthorizedException('Clé de synchronisation invalide');
    }
    return true;
  }
}
