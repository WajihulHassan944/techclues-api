import { Controller, Get, Param } from '@nestjs/common';
import { PageContentService } from './page-content.service';

@Controller('public/page-content')
export class PublicPageContentController {
  constructor(private readonly content: PageContentService) {}

  @Get(':page')
  get(@Param('page') page: string) {
    return this.content.get(page);
  }
}
