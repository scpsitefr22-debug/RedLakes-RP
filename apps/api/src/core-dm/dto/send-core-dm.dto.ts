import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendCoreDmDto {
  @IsString()
  @MinLength(1)
  toUsername: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
