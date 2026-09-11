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

  private async clearanceLevelOf(req: OptionalAuthRequest) {
    return req.user ? this.players.getClearanceLevel(req.user.id) : 1;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async query(
    @Query('q') q: string,
    @Req() req: OptionalAuthRequest,
    @Query('limit') limit?: string,
  ) {
    const [departmentId, clearanceLevel] = await Promise.all([
      this.departmentIdOf(req),
      this.clearanceLevelOf(req),
    ]);
    return this.searchService.search(
      q ?? '',
      limit ? parseInt(limit) : 20,
      departmentId,
      clearanceLevel,
    );
  }
}
