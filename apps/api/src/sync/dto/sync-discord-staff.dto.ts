import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { StaffRank } from '@prisma/client';

export class SyncDiscordStaffDto {
  @IsString()
  @MinLength(5)
  discordId!: string;

  @IsBoolean()
  hasStaffRole!: boolean;

  /** Rang detecte depuis les roles Discord nommes (Surveillant/Officier/Coordinateur Général/Fondateur) */
  @IsOptional()
  @IsEnum(StaffRank)
  staffRank?: StaffRank;
}
