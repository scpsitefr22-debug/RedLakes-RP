import { MissionStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMissionDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(3)
  description!: string;

  @IsOptional()
  @IsString()
  reward?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  assignedPlayerId?: string;

  @IsOptional()
  @IsString()
  assignedTeamId?: string;
}

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @IsString()
  reward?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

export class UpdateMissionStatusDto {
  @IsEnum(MissionStatus)
  status!: MissionStatus;
}
