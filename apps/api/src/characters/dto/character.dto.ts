import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  title!: string;

  @IsString()
  faction!: string;

  @IsString()
  biography!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quotes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  history?: string[];

  @IsOptional()
  @IsString()
  portrait?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];
}

export class UpdateCharacterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  faction?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quotes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  history?: string[];

  @IsOptional()
  @IsString()
  portrait?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];
}
