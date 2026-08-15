import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  factionId?: string;

  @IsOptional()
  @IsString()
  omegaTier?: string;

  @IsOptional()
  @IsString()
  directorGradeName?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsString()
  chefId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deputyIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  factionId?: string;

  @IsOptional()
  @IsString()
  omegaTier?: string;

  @IsOptional()
  @IsString()
  directorGradeName?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsString()
  chefId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deputyIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;
}
