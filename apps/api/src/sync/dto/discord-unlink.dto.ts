import { IsString } from 'class-validator';

export class DiscordUnlinkDto {
  @IsString()
  discordId!: string;
}
