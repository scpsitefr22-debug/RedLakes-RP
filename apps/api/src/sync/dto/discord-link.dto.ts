import { IsOptional, IsString } from 'class-validator';

export class DiscordLinkDto {
  @IsString()
  code!: string;

  @IsString()
  discordId!: string;

  @IsOptional()
  @IsString()
  discordUsername?: string;
}
