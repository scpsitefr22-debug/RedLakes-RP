import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CoreDmChannel } from '@prisma/client';

export class SendCoreDmDto {
  @IsString()
  @MinLength(1)
  toUsername: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsEnum(CoreDmChannel)
  channel?: CoreDmChannel;
}
