import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewScpDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  staffNote?: string;
}
