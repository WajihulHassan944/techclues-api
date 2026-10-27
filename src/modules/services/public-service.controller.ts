import { Controller, Get, Param } from '@nestjs/common';
import { ServiceService } from './service.service';

@Controller('public/services')
export class PublicServiceController {
  constructor(private readonly services: ServiceService) {}

  @Get()
  list() {
    return this.services.listPublic();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.services.getPublic(slug);
  }
}
