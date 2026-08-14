import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { PersonnelReportType } from '@prisma/client';

export class CreatePersonnelReportDto {
  @IsEnum(PersonnelReportType)
  type!: PersonnelReportType;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  content!: string;
}
