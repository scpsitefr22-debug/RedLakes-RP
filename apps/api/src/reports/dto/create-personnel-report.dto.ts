import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PersonnelReportType } from '@prisma/client';

export class CreatePersonnelReportDto {
  @IsEnum(PersonnelReportType)
  type!: PersonnelReportType;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  content!: string;
}

/** Rapport envoyé par le plugin Minecraft (clé API serveur, jamais un joueur directement). */
export class CreateMinecraftReportDto extends CreatePersonnelReportDto {
  // Généré par le plugin à la saisie, conservé tel quel lors des renvois.
  @IsUUID()
  eventId!: string;

  // Position calculée côté serveur Minecraft (monde + coordonnées).
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;
}
