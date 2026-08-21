import { StaffRank } from '@prisma/client';

/**
 * Ordre croissant des rangs staff — un rang plus haut couvre tout ce qu'un
 * rang plus bas couvre. Source unique partagée entre RolesGuard (contrôle
 * d'accès) et SyncService (promotion depuis Discord, jamais de rétrogradation).
 */
export const STAFF_RANK_ORDER: Record<StaffRank, number> = {
  [StaffRank.SURVEILLANT]: 1,
  [StaffRank.OFFICIER]: 2,
  [StaffRank.COORDINATEUR_GENERAL]: 3,
};
