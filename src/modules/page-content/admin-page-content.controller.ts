import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Feature } from '../auth/feature.decorator';
import { PageContentService } from './page-content.service';
import { UpdatePageContentDto } from './dto/page-content.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Feature('homepage')
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
