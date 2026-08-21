import { SetMetadata } from '@nestjs/common';
import { StaffRank } from '@prisma/client';

export const MIN_RANK_KEY = 'minRank';

/**
 * Rang staff minimum requis, EN PLUS de @Roles(STAFF, ADMIN). ADMIN
 * (Fondateur) passe toujours, quel que soit son staffRank — voir RolesGuard.
 */
export const MinRank = (rank: StaffRank) => SetMetadata(MIN_RANK_KEY, rank);
