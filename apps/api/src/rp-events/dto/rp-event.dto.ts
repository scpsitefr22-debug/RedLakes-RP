import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRpEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  briefing?: string;

  @IsOptional()
  @IsString()
  factionId?: string;
}

export class UpdateRpEventDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  briefing?: string;
}

// Longueurs volontairement courtes : ces textes sont affichés tels quels
// dans le chat Minecraft (une ligne par champ).
export class CreateRpEventAssignmentDto {
  @IsString()
  playerId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  roleLabel!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  equipment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  instruction?: string;
}
