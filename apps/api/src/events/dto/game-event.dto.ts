import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
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
  @IsInt()
  @Min(1)
  clearance?: number;
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
  @IsInt()
  @Min(1)
  clearance?: number;
}
