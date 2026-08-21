import { AlertLevel } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSystemStateDto {
  @IsOptional()
  @IsBoolean()
  serverOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  recruitmentOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenance?: boolean;

  @IsOptional()
  @IsEnum(AlertLevel)
  alertLevel?: AlertLevel;

  @IsOptional()
  @IsString()
  alertNote?: string;
}
