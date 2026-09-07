import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  /**
   * Requis si le compte n'a pas encore de pseudo de connexion (cas des
   * comptes crees via Discord/dev-login, qui n'ont jamais eu de `username`)
   * — verifie cote service, pas ici, car l'obligation depend de l'etat du
   * compte, pas du DTO seul.
   */
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Pseudo : lettres, chiffres, tirets et underscores uniquement',
  })
  username?: string;

  /**
   * Requis si le compte a deja un mot de passe (changement, pas premiere
   * definition) — verifie cote service pour la meme raison que `username`.
   */
  @IsOptional()
  @IsString()
  @MaxLength(72)
  currentPassword?: string;
}
