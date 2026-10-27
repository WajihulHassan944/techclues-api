import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PageContentService } from './page-content.service';
import { UpdatePageContentDto } from './dto/page-content.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin', 'editor')
@Controller('admin/page-content')
export class AdminPageContentController {
  constructor(private readonly content: PageContentService) {}

  @Get(':page')
  get(@Param('page') page: string) {
    return this.content.get(page);
  }

  @Put(':page')
  update(@Param('page') page: string, @Body() dto: UpdatePageContentDto) {
    return this.content.update(page, dto.blocks);
  }
}
