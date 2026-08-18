import { ScpClass } from '@prisma/client';
import { IsEnum, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class ProposeScpDto {
  @IsString()
  @MinLength(1)
  number!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(ScpClass)
  class!: ScpClass;

  @IsInt()
  @Min(0)
  @Max(5)
  threatLevel!: number;

  @IsString()
  @MinLength(20)
  containment!: string;

  @IsString()
  @MinLength(20)
  history!: string;

  @IsString()
  @MinLength(20)
  description!: string;
}
