import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Comme AuthGuard, mais ne rejette jamais — attache req.user si une session
 * valide existe, sinon laisse la requete continuer anonyme. Sert aux routes
 * publiques qui doivent quand meme filtrer le contenu selon le departement
 * du joueur quand il est connecte (wiki, personnages, evenements, lore).
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token =
      req.cookies?.['redlakes_token'] ||
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const user = await this.auth.validateSession(token);
      if (user) req.user = user;
    }

    return true;
  }
}
