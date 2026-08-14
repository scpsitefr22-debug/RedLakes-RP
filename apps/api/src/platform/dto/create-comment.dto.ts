import { PlatformEntityType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsEnum(PlatformEntityType)
  entityType!: PlatformEntityType;

  @IsString()
  @MinLength(1)
  entityId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsBoolean()
  internal?: boolean;
}
