import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffRank, UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { MIN_RANK_KEY } from './rank.decorator';

/** Ordre croissant — un rang plus haut couvre tout ce qu'un rang plus bas couvre */
const RANK_ORDER: Record<StaffRank, number> = {
  [StaffRank.SURVEILLANT]: 1,
  [StaffRank.OFFICIER]: 2,
  [StaffRank.COORDINATEUR_GENERAL]: 3,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const minRank = this.reflector.getAllAndOverride<StaffRank>(MIN_RANK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest() as {
      user?: { role: UserRole; staffRank: StaffRank | null };
    };

    if (roles?.length && (!user || !roles.includes(user.role))) {
      throw new ForbiddenException('Accès refusé');
    }

    // ADMIN (Fondateur) passe toujours — un rang staff n'a de sens que
    // pour un compte STAFF, ADMIN a deja l'acces total par definition.
    if (minRank && user?.role !== UserRole.ADMIN) {
      const currentRank = user?.staffRank ? RANK_ORDER[user.staffRank] : 0;
      if (currentRank < RANK_ORDER[minRank]) {
        throw new ForbiddenException('Rang staff insuffisant');
      }
    }

    return true;
  }
}
