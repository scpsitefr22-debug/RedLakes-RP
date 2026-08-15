import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  departmentId!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  composition?: string[];

  @IsOptional()
  @IsBoolean()
  hasMedic?: boolean;

  @IsOptional()
  @IsString()
  customizableBy?: string;

  @IsOptional()
  @IsString()
  chefId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quota?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  composition?: string[];

  @IsOptional()
  @IsBoolean()
  hasMedic?: boolean;

  @IsOptional()
  @IsString()
  customizableBy?: string;

  @IsOptional()
  @IsString()
  chefId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quota?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
