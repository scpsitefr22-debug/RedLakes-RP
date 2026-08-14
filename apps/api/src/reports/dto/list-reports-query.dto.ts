import { IsEnum, IsOptional } from 'class-validator';
import { PersonnelReportStatus, PersonnelReportType } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ListReportsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PersonnelReportStatus)
  status?: PersonnelReportStatus;

  @IsOptional()
  @IsEnum(PersonnelReportType)
  type?: PersonnelReportType;
}
