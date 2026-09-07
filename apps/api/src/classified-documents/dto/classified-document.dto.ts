import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ClassifiedDocumentStatus } from '@prisma/client';

export class CreateClassifiedDocumentDto {
  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsOptional()
  @IsEnum(ClassifiedDocumentStatus)
  status?: ClassifiedDocumentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];

  @IsOptional()
  @IsString()
  factionId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedEventIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedScpIds?: string[];
}

export class UpdateClassifiedDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ClassifiedDocumentStatus)
  status?: ClassifiedDocumentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];

  @IsOptional()
  @IsString()
  factionId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedEventIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedScpIds?: string[];
}
