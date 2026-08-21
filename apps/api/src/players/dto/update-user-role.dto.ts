import { IsEnum, IsOptional } from 'class-validator';
import { StaffRank, UserRole } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;

  /** Rang staff (Surveillant/Officier/Coordinateur Général) — sans effet si role != STAFF */
  @IsOptional()
  @IsEnum(StaffRank)
  staffRank?: StaffRank;
}
