import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SyncRoleDto {
  @IsString()
  minecraftUsername!: string;

  @IsOptional()
  @IsString()
  minecraftUuid?: string;

  @IsString()
  grade!: string;

  @IsOptional()
  @IsString()
  faction?: string;

  @IsOptional()
  @IsString()
  teamName?: string;

  @IsOptional()
  @IsString()
  rpFirstName?: string;

  @IsOptional()
  @IsString()
  rpLastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  playtime?: number;
}
