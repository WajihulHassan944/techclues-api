import { Controller, Get } from '@nestjs/common';
import { FooterLinkService } from './footer-link.service';

@Controller('public/footer-links')
export class PublicFooterLinkController {
  constructor(private readonly links: FooterLinkService) {}

  @Get()
  list() {
    return this.links.listPublicGrouped();
  }
}
