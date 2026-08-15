import { AssignmentEntityType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  playerId!: string;

  @IsEnum(AssignmentEntityType)
  entityType!: AssignmentEntityType;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
