import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  query(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.searchService.search(q ?? '', limit ? parseInt(limit) : 20);
  }
}
