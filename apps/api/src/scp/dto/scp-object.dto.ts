import { ScpClass } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

class IncidentDto {
  date!: string;
  summary!: string;
}

class TestDto {
  date!: string;
  researcher!: string;
  result!: string;
}

class AddendumDto {
  author!: string;
  content!: string;
  restrictedDepartmentIds?: string[];
}

export class CreateScpObjectDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  number!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(ScpClass)
  class!: ScpClass;

  @IsInt()
  @Min(0)
  threatLevel!: number;

  @IsString()
  containment!: string;

  @IsString()
  history!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  incidents?: IncidentDto[];

  @IsOptional()
  @IsArray()
  tests?: TestDto[];

  @IsOptional()
  @IsArray()
  addendums?: AddendumDto[];

  @IsOptional()
  @IsString()
  containmentCost?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  personnelAssigned?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  breachCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];
}

export class UpdateScpObjectDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ScpClass)
  class?: ScpClass;

  @IsOptional()
  @IsInt()
  @Min(0)
  threatLevel?: number;

  @IsOptional()
  @IsString()
  containment?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  incidents?: IncidentDto[];

  @IsOptional()
  @IsArray()
  tests?: TestDto[];

  @IsOptional()
  @IsArray()
  addendums?: AddendumDto[];

  @IsOptional()
  @IsString()
  containmentCost?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  personnelAssigned?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  breachCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];
}
