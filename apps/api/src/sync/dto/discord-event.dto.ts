import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const TRANSMISSION_TYPES = [
  'MESSAGE',
  'ANNOUNCE',
  'MEMBER_JOIN',
  'MEMBER_LEAVE',
  'EVENT',
  'BOOST',
] as const;

export type TransmissionTypeDto = (typeof TRANSMISSION_TYPES)[number];

/**
 * Évènement Discord brut envoyé par le bot. L'API se charge de l'anonymisation
 * (codename) et de l'habillage RP. Le bot n'envoie le contenu/pseudo réel que
 * pour les salons explicitement publics.
 */
export class DiscordEventDto {
  @IsIn(TRANSMISSION_TYPES)
  type!: TransmissionTypeDto;

  @IsOptional()
  @IsString()
  discordMessageId?: string;

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  channelLabel?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  clearance?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  /** ID Discord de l'auteur — utilisé uniquement pour générer un codename stable. */
  @IsOptional()
  @IsString()
  authorId?: string;

  /** Pseudo affiché — transmis seulement pour les salons publics. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  authorDisplay?: string;

  /** Extrait du message — transmis seulement pour les salons publics. */
  @IsOptional()
  @IsString()
  @MaxLength(400)
  contentExcerpt?: string;

  /** Horodatage de l'évènement côté Discord (ISO). */
  @IsOptional()
  @IsString()
  occurredAt?: string;
}
