import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/**
 * @Query() ne declenche la transformation class-validator (donc @Type(()
 * => Number) sur page/limit dans PaginationQueryDto) que si le parametre
 * est type par une vraie classe DTO — un type intersection inline
 * (PaginationQueryDto & { unreadOnly?: string }) n'est pas reflete par
 * Nest et laisse passer page/limit en string brute, faisant planter Prisma
 * (`take` attend un Int). Cette classe corrige ca en etendant reellement
 * PaginationQueryDto.
 */
export class NotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  unreadOnly?: string;
}
