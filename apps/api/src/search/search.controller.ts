import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SearchService } from './search.service';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { PlayersService } from '../players/players.service';

type OptionalAuthRequest = Request & { user?: { id: string } };

@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    private players: PlayersService,
  ) {}

  private async departmentIdOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getDepartmentId(req.user.id) : null;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async query(
    @Query('q') q: string,
    @Req() req: OptionalAuthRequest,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search(
      q ?? '',
      limit ? parseInt(limit) : 20,
      await this.departmentIdOf(req),
    );
  }
}
