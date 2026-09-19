import { IsString, MinLength } from 'class-validator';

export class AssignGradeDto {
  @IsString()
  @MinLength(1)
  gradeId!: string;
}
