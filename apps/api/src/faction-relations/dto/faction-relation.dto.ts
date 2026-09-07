import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FactionRelationStatus } from '@prisma/client';

export class SetFactionRelationDto {
  @IsString()
  factionAId!: string;

  @IsString()
  factionBId!: string;

  @IsEnum(FactionRelationStatus)
  status!: FactionRelationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateFactionRelationDto {
  @IsOptional()
  @IsEnum(FactionRelationStatus)
  status?: FactionRelationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
