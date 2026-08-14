import { IsEnum, IsOptional } from 'class-validator';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ListApplicationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(ApplicationType)
  type?: ApplicationType;
}
