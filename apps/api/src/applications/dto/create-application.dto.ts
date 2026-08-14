import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApplicationType } from '@prisma/client';

export class CreateApplicationDto {
  @IsEnum(ApplicationType)
  type!: ApplicationType;

  @IsString()
  @MinLength(20)
  experience!: string;

  @IsString()
  @MinLength(20)
  motivation!: string;
}

export class ReviewApplicationDto {
  @IsEnum(['APPROVED', 'REJECTED'] as const)
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  staffNote?: string;
}
