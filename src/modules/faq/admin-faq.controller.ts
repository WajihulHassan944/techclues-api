import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FaqService } from './faq.service';
import { CreateFaqDto, ReorderFaqDto, UpdateFaqDto } from './dto/faq.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin', 'editor')
@Controller('admin/faqs')
export class AdminFaqController {
  constructor(private readonly faqs: FaqService) {}

  @Get()
  list() {
    return this.faqs.listAll();
  }

  @Get('groups')
  listGroups() {
    return this.faqs.listGroups();
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqs.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderFaqDto) {
    return this.faqs.reorder(dto.group, dto.ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqs.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.faqs.remove(id);
    return { ok: true };
  }
}
