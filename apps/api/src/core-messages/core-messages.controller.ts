import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CoreMessagesService } from './core-messages.service';
import { CreateCoreMessageDto } from './dto/create-core-message.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '../auth/auth.guard';

type AuthedRequest = Request & { user: { id: string } };

@Controller('core-messages')
@UseGuards(AuthGuard)
export class CoreMessagesController {
  constructor(private messages: CoreMessagesService) {}

  @Get('me')
  findMine(@Req() req: AuthedRequest, @Query() query: PaginationQueryDto) {
    return this.messages.findForUser(req.user.id, query);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateCoreMessageDto) {
    return this.messages.create(req.user.id, dto.content);
  }
}
