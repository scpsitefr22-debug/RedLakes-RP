import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FactionsService } from './factions.service';

@Controller('factions')
export class FactionsController {
  constructor(private factions: FactionsService) {}

  @Get()
  findAll() {
    return this.factions.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const faction = await this.factions.findOne(slug);
    if (!faction) throw new NotFoundException('Faction introuvable');
    return faction;
  }
}
