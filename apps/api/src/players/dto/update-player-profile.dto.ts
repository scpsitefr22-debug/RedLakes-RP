import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlayerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  rpFirstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  rpLastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  teamName?: string;
}
