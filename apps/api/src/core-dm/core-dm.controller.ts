import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CoreDmService } from './core-dm.service';
import { SendCoreDmDto } from './dto/send-core-dm.dto';
import { AuthGuard } from '../auth/auth.guard';

type AuthedRequest = Request & { user: { id: string } };

@Controller('core-dm')
@UseGuards(AuthGuard)
export class CoreDmController {
  constructor(private dm: CoreDmService) {}

  @Get('conversations')
  listConversations(@Req() req: AuthedRequest) {
    return this.dm.listConversations(req.user.id);
  }

  @Get('unread-count')
  unreadCount(@Req() req: AuthedRequest) {
    return this.dm.unreadCount(req.user.id);
  }

  @Get('with/:username')
  getThread(@Req() req: AuthedRequest, @Param('username') username: string) {
    return this.dm.getThread(req.user.id, username);
  }

  @Post()
  send(@Req() req: AuthedRequest, @Body() dto: SendCoreDmDto) {
    return this.dm.send(req.user.id, dto.toUsername, dto.content);
  }
}
