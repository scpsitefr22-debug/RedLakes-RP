import { Controller, Get, Header, Param } from '@nestjs/common';
import { SkinsService } from './skins.service';

/** Public : un skin Minecraft est déjà visible de tous en jeu. */
@Controller('skins')
export class SkinsController {
  constructor(private skins: SkinsService) {}

  @Get(':username')
  @Header('Cache-Control', 'public, max-age=3600')
  find(@Param('username') username: string) {
    return this.skins.find(username);
  }
}
