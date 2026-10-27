import { Controller, Get, Header, Post, Query, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SeoService } from './seo.service';
import { Report404Dto } from './dto/seo.dto';

@Controller('public/seo')
export class PublicSeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('page')
  getPage(@Query('path') path: string) {
    return this.seo.getPublicPage(path || '/');
  }

  @Get('redirects')
  listRedirects() {
    return this.seo.listPublicRedirects();
  }

  @Get('redirect')
  resolveRedirect(@Query('path') path: string) {
    return this.seo.resolveRedirect(path);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('404')
  @HttpCode(200)
  async report404(@Body() dto: Report404Dto) {
    await this.seo.report404(dto.path, dto.referrer);
    return { ok: true };
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  sitemap() {
    return this.seo.buildSitemap();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  robots() {
    return this.seo.buildRobotsTxt();
  }
}
