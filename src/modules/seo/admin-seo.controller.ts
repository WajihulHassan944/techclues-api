import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SeoService } from './seo.service';
import { CreateRedirectDto, UpdateRedirectDto, UpsertSeoEntryDto } from './dto/seo.dto';
import { CreateBacklinkDto, UpdateBacklinkDto } from './dto/backlink.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin', 'seo_manager')
@Controller('admin/seo')
export class AdminSeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('pages')
  listPages() {
    return this.seo.listPages();
  }

  @Get('pages/by-path')
  getPage(@Query('path') path: string) {
    return this.seo.getPage(path);
  }

  @Post('pages')
  upsertPage(@Body() dto: UpsertSeoEntryDto) {
    return this.seo.upsertPage(dto);
  }

  @Delete('pages')
  deletePage(@Query('path') path: string) {
    return this.seo.deletePage(path);
  }

  @Get('redirects')
  listRedirects() {
    return this.seo.listRedirects();
  }

  @Post('redirects')
  createRedirect(@Body() dto: CreateRedirectDto) {
    return this.seo.createRedirect(dto);
  }

  @Patch('redirects/:id')
  updateRedirect(@Param('id') id: string, @Body() dto: UpdateRedirectDto) {
    return this.seo.updateRedirect(id, dto);
  }

  @Delete('redirects/:id')
  deleteRedirect(@Param('id') id: string) {
    return this.seo.deleteRedirect(id);
  }

  @Get('404s')
  list404s() {
    return this.seo.list404s();
  }

  @Patch('404s/:id/resolve')
  resolve404(@Param('id') id: string) {
    return this.seo.resolve404(id);
  }

  @Get('backlinks')
  listBacklinks() {
    return this.seo.listBacklinks();
  }

  @Get('backlinks/stats')
  backlinkStats() {
    return this.seo.backlinkStats();
  }

  @Post('backlinks')
  createBacklink(@Body() dto: CreateBacklinkDto) {
    return this.seo.createBacklink(dto);
  }

  @Patch('backlinks/:id')
  updateBacklink(@Param('id') id: string, @Body() dto: UpdateBacklinkDto) {
    return this.seo.updateBacklink(id, dto);
  }

  @Delete('backlinks/:id')
  deleteBacklink(@Param('id') id: string) {
    return this.seo.deleteBacklink(id);
  }
}
