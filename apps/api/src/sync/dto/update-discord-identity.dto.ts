import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDiscordIdentityDto {
  @IsString()
  discordId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  rpFirstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  rpLastName?: string;
}
