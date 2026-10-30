import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Feature } from '../auth/feature.decorator';
import { FooterLinkService } from './footer-link.service';
import {
  CreateFooterLinkDto,
  ReorderFooterLinksDto,
  UpdateFooterLinkDto,
} from './dto/footer-link.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Feature('footer-links')
@Controller('admin/footer-links')
export class AdminFooterLinkController {
  constructor(private readonly links: FooterLinkService) {}

  @Get()
  list() {
    return this.links.listAll();
  }

  @Post()
  create(@Body() dto: CreateFooterLinkDto) {
    return this.links.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderFooterLinksDto) {
    return this.links.reorder(dto.group, dto.ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFooterLinkDto) {
    return this.links.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.links.remove(id);
    return { ok: true };
  }
}
