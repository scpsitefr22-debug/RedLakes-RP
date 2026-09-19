import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CoreDmChannel } from '@prisma/client';
import { CoreDmService } from './core-dm.service';
import { SendCoreDmDto } from './dto/send-core-dm.dto';
import { AuthGuard } from '../auth/auth.guard';

type AuthedRequest = Request & { user: { id: string } };

const channelOf = (raw?: string): CoreDmChannel =>
  raw === CoreDmChannel.PROFESSIONNEL ? CoreDmChannel.PROFESSIONNEL : CoreDmChannel.PERSONNEL;

@Controller('core-dm')
@UseGuards(AuthGuard)
export class CoreDmController {
  constructor(private dm: CoreDmService) {}

  @Get('conversations')
  listConversations(@Req() req: AuthedRequest, @Query('channel') channel?: string) {
    return this.dm.listConversations(req.user.id, channelOf(channel));
  }

  @Get('unread-count')
  unreadCount(@Req() req: AuthedRequest) {
    return this.dm.unreadCount(req.user.id);
  }

  @Get('contacts')
  listContacts(@Req() req: AuthedRequest) {
    return this.dm.listContacts(req.user.id);
  }

  @Get('with/:username')
  getThread(
    @Req() req: AuthedRequest,
    @Param('username') username: string,
    @Query('channel') channel?: string,
  ) {
    return this.dm.getThread(req.user.id, username, channelOf(channel));
  }

  @Post()
  send(@Req() req: AuthedRequest, @Body() dto: SendCoreDmDto) {
    return this.dm.send(req.user.id, dto.toUsername, dto.content, dto.channel);
  }
}
