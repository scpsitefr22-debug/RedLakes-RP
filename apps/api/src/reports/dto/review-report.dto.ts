import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewReportDto {
  @IsEnum(['REVIEWED', 'ARCHIVED'] as const)
  status!: 'REVIEWED' | 'ARCHIVED';

  @IsOptional()
  @IsString()
  staffNote?: string;
}
