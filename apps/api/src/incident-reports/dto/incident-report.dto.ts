import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { IncidentThreatClass } from '@prisma/client';

class PersonnelRowDto {
  unite!: string;
  grade!: string;
  statut!: string;
  obs!: string;
}

class EquipmentRowDto {
  designation!: string;
  quantite!: string;
  etat!: string;
  cout!: number;
}

export class CreateIncidentReportDto {
  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(3)
  reference!: string;

  @IsDateString()
  incidentAt!: string;

  @IsString()
  @MinLength(2)
  anomalyLabel!: string;

  @IsOptional()
  @IsEnum(IncidentThreatClass)
  threatClass?: IncidentThreatClass;

  @IsOptional()
  @IsString()
  factsTag?: string;

  @IsString()
  @MinLength(10)
  narrative!: string;

  @IsOptional()
  @IsArray()
  personnelRows?: PersonnelRowDto[];

  @IsOptional()
  @IsArray()
  equipmentRows?: EquipmentRowDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCost?: number;

  @IsString()
  @MinLength(2)
  authorLabel!: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  validatorLabel?: string;

  @IsOptional()
  @IsString()
  validatorRole?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minClearanceLevel?: number;
}

export class UpdateIncidentReportDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  reference?: string;

  @IsOptional()
  @IsDateString()
  incidentAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  anomalyLabel?: string;

  @IsOptional()
  @IsEnum(IncidentThreatClass)
  threatClass?: IncidentThreatClass;

  @IsOptional()
  @IsString()
  factsTag?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  narrative?: string;

  @IsOptional()
  @IsArray()
  personnelRows?: PersonnelRowDto[];

  @IsOptional()
  @IsArray()
  equipmentRows?: EquipmentRowDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCost?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  authorLabel?: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  validatorLabel?: string;

  @IsOptional()
  @IsString()
  validatorRole?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedDepartmentIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minClearanceLevel?: number;
}
