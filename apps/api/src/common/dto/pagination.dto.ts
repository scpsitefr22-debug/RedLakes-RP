import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export function resolvePagination(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
    order: query.order ?? 'desc',
    sort: query.sort,
  };
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}
