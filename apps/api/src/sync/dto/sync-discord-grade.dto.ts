import { IsOptional, IsString, MinLength } from 'class-validator';

export class SyncDiscordGradeDto {
  @IsString()
  @MinLength(5)
  discordId!: string;

  @IsString()
  @MinLength(1)
  grade!: string;

  @IsOptional()
  @IsString()
  discordRoleName?: string;
}
