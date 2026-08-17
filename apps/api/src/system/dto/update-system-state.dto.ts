import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSystemStateDto {
  @IsOptional()
  @IsBoolean()
  serverOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  recruitmentOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenance?: boolean;
}
