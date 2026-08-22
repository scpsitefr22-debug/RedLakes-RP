import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCoreMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
