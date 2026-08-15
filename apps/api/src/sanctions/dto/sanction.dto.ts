import { SanctionStatus, SanctionType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateSanctionDto {
  @IsString()
  playerId!: string;

  @IsEnum(SanctionType)
  type!: SanctionType;

  @IsString()
  @MinLength(3)
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateSanctionDto {
  @IsOptional()
  @IsEnum(SanctionType)
  type?: SanctionType;

  @IsOptional()
  @IsEnum(SanctionStatus)
  status?: SanctionStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
