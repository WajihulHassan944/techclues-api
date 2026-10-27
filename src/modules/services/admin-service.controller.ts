import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ServiceService } from './service.service';
import { ReorderServicesDto, UpdateServiceDto } from './dto/service.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin', 'editor')
@Controller('admin/services')
export class AdminServiceController {
  constructor(private readonly services: ServiceService) {}

  @Get()
  list() {
    return this.services.listAll();
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderServicesDto) {
    return this.services.reorder(dto.slugs);
  }

  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(slug, dto);
  }
}
