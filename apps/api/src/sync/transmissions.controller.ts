import { Controller, Get, Query } from '@nestjs/common';
import { TransmissionService } from './transmission.service';

/**
 * Lecture publique du flux « Transmissions de la Fondation » consommé par le site.
 * Aucune clé requise : le contenu est déjà anonymisé / habillé RP par l'API.
 */
@Controller('transmissions')
export class TransmissionsController {
  constructor(private transmissions: TransmissionService) {}

  @Get()
  list(@Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : 60;
    return this.transmissions.list(Number.isNaN(parsed) ? 60 : parsed);
  }
}
