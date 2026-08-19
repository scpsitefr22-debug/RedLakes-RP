import { IsBoolean, IsString, MinLength } from 'class-validator';

export class SyncDiscordStaffDto {
  @IsString()
  @MinLength(5)
  discordId!: string;

  @IsBoolean()
  hasStaffRole!: boolean;
}
