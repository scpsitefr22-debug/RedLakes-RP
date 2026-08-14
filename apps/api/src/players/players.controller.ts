import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PlayersService } from './players.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { SyncService } from '../sync/sync.service';

@Controller('players')
export class PlayersController {
  constructor(
    private players: PlayersService,
    private sync: SyncService,
  ) {}

  @Get()
  findAll() {
    return this.players.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: Request & { user: { id: string } }) {
    return this.players.getDashboard(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpdatePlayerProfileDto,
  ) {
    await this.sync.updateRpIdentity(req.user.id, dto);
    return this.players.getDashboard(req.user.id);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.players.findByUsername(username);
  }
}
