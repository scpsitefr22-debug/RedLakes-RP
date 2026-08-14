import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { LoreCategory, LoreStatus } from '@prisma/client';

export class CreateLoreDto {
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

  @IsEnum(LoreCategory)
  category!: LoreCategory;

  @IsOptional()
  @IsEnum(LoreStatus)
  status?: LoreStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  clearance?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateLoreDto {
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
  @IsEnum(LoreCategory)
  category?: LoreCategory;

  @IsOptional()
  @IsEnum(LoreStatus)
  status?: LoreStatus;

  @IsOptional()
  @IsInt()
  clearance?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
