import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateGameEventDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsDateString()
  date!: string;

  @IsString()
  type!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  casualties?: string;

  @IsString()
  outcome!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];
}

export class UpdateGameEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  casualties?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];
}
