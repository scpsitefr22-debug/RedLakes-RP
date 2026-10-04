import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ACCESS_ZONE_CODES, SITE_SECTION_CODES } from '../grade-access-codes';

/** Ce que la grille des acces peut changer sur un grade (champs absents = inchanges). */
export class GradeAccessChangeDto {
  @IsString()
  id!: string;

  /**
   * updatedAt du grade tel que la grille l'a charge : si quelqu'un d'autre a
   * enregistre entre-temps, la demande est refusee au lieu d'ecraser son travail.
   */
  @IsISO8601()
  updatedAt!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(ACCESS_ZONE_CODES, { each: true })
  accessZones?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(SITE_SECTION_CODES, { each: true })
  siteSections?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  utilities?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  clearanceLevel?: number;

  /** null = pas de salaire defini. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  pay?: number | null;

  /** null = pas de quota defini. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  quota?: number | null;
}

export class UpdateGradeAccessDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => GradeAccessChangeDto)
  changes!: GradeAccessChangeDto[];
}
