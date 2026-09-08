import { IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  username!: string;
}
