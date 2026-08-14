import { Controller, Get, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private gallery: GalleryService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.gallery.findAll(type);
  }
}
