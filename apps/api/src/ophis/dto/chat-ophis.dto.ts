import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OphisHistoryTurnDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(2000)
  content!: string;
}

export class ChatWithOphisDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message!: string;

  /** Derniers tours de la conversation — le client renvoie l'historique, l'API ne le stocke pas */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OphisHistoryTurnDto)
  history?: OphisHistoryTurnDto[];
}
