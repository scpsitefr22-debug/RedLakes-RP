import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  branch!: string;

  @IsString()
  tier!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  departmentRefId?: string;

  @IsOptional()
  @IsInt()
  pay?: number;

  @IsOptional()
  @IsInt()
  quota?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  clearance!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessZones?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  siteSections?: string[];
}

export class UpdateGradeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  departmentRefId?: string;

  @IsOptional()
  @IsInt()
  pay?: number;

  @IsOptional()
  @IsInt()
  quota?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  clearance?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessZones?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  siteSections?: string[];
}
