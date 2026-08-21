import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OphisService } from './ophis.service';
import { ChatWithOphisDto } from './dto/chat-ophis.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ophis')
@UseGuards(AuthGuard)
export class OphisController {
  constructor(private ophis: OphisService) {}

  @Post('chat')
  chat(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: ChatWithOphisDto,
  ) {
    return this.ophis.chat(req.user.id, dto);
  }
}
